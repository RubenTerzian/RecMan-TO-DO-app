import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { useStore } from "@/store/store";

type ColumnDropEdge = "left" | "right";

type TouchColumnDropTarget = {
  columnId: string;
  edge: ColumnDropEdge;
};

type ColumnDragState = {
  draggingColumnId: string | null;
  dropTargetColumnId: string | null;
  dropTargetEdge: ColumnDropEdge | null;
};

type Listener = () => void;

export type ColumnDragAndDropContextValue = {
  registerColumnElement(columnId: string, element: HTMLElement | null): void;
  registerColumnDragHandle(columnId: string, element: HTMLElement | null): void;
};

const DEFAULT_DRAG_STATE: ColumnDragState = {
  draggingColumnId: null,
  dropTargetColumnId: null,
  dropTargetEdge: null,
};

function shouldIgnoreDragStart(
  target: EventTarget | null,
  handleElement: HTMLElement,
) {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactiveElement = target.closest(
    'button, input, textarea, select, option, a, label, [role="button"], [contenteditable="true"], [data-no-drag="true"]',
  );

  if (!interactiveElement || !handleElement.contains(interactiveElement)) {
    return false;
  }

  return interactiveElement.getAttribute("data-drag-handle") !== "true";
}

function createColumnDragStateStore() {
  let state = DEFAULT_DRAG_STATE;
  const listeners = new Set<Listener>();

  return {
    getSnapshot() {
      return state;
    },
    reset() {
      state = DEFAULT_DRAG_STATE;
      listeners.forEach((listener) => listener());
    },
    setState(nextState: ColumnDragState) {
      if (
        state.draggingColumnId === nextState.draggingColumnId &&
        state.dropTargetColumnId === nextState.dropTargetColumnId &&
        state.dropTargetEdge === nextState.dropTargetEdge
      ) {
        return;
      }

      state = nextState;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const columnDragStateStore = createColumnDragStateStore();

export const ColumnDragAndDropContext =
  createContext<ColumnDragAndDropContextValue | null>(null);

export function useColumnDragAndDropContext() {
  const context = useContext(ColumnDragAndDropContext);

  if (!context) {
    throw new Error("Column drag-and-drop context is not available.");
  }

  return context;
}

function setDraggingDocumentState(isDragging: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.cursor = isDragging ? "grabbing" : "";
  document.body.style.userSelect = isDragging ? "none" : "";
}

export function useColumnDragAndDrop() {
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const columnElementsRef = useRef(new Map<string, HTMLElement>());
  const dragHandleElementsRef = useRef(new Map<string, HTMLElement>());
  const handleCleanupRef = useRef(new Map<string, () => void>());
  const selectionModeRef = useRef(useStore.getState().selectionMode);

  useEffect(() => {
    return useStore.subscribe((state) => {
      if (state.selectionMode === selectionModeRef.current) {
        return;
      }

      selectionModeRef.current = state.selectionMode;

      if (state.selectionMode) {
        columnDragStateStore.reset();
        setDraggingDocumentState(false);
      }
    });
  }, []);

  const getTouchDropTarget = useCallback(
    (
      clientX: number,
      clientY: number,
      draggingColumnId: string,
    ): TouchColumnDropTarget | null => {
      for (const [columnId, element] of columnElementsRef.current.entries()) {
        if (columnId === draggingColumnId) {
          continue;
        }

        const rect = element.getBoundingClientRect();

        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          continue;
        }

        return {
          columnId,
          edge: clientX <= rect.left + rect.width / 2 ? "left" : "right",
        };
      }

      return null;
    },
    [],
  );

  const autoScrollBoardViewport = useCallback((clientX: number) => {
    const boardViewport = boardViewportRef.current;

    if (!boardViewport) {
      return;
    }

    const rect = boardViewport.getBoundingClientRect();
    const edgeThreshold = 56;
    const scrollStep = 18;

    if (clientX <= rect.left + edgeThreshold) {
      boardViewport.scrollBy({ left: -scrollStep });

      return;
    }

    if (clientX >= rect.right - edgeThreshold) {
      boardViewport.scrollBy({ left: scrollStep });
    }
  }, []);

  const clearDropTarget = useCallback(() => {
    const currentState = columnDragStateStore.getSnapshot();

    if (
      currentState.dropTargetColumnId === null &&
      currentState.dropTargetEdge === null
    ) {
      return;
    }

    columnDragStateStore.setState({
      ...currentState,
      dropTargetColumnId: null,
      dropTargetEdge: null,
    });
  }, []);

  const updateDropTarget = useCallback(
    (columnId: string, nextEdge: ColumnDropEdge | null) => {
      const currentState = columnDragStateStore.getSnapshot();

      columnDragStateStore.setState({
        ...currentState,
        dropTargetColumnId: columnId,
        dropTargetEdge: nextEdge,
      });
    },
    [],
  );

  const registerColumnElement = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        columnElementsRef.current.delete(columnId);

        return;
      }

      columnElementsRef.current.set(columnId, element);
    },
    [],
  );

  const registerColumnDragHandle = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      handleCleanupRef.current.get(columnId)?.();
      handleCleanupRef.current.delete(columnId);

      if (!element) {
        dragHandleElementsRef.current.delete(columnId);

        return;
      }

      dragHandleElementsRef.current.set(columnId, element);

      const onPointerDown = (event: PointerEvent) => {
        if (selectionModeRef.current) {
          return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        if (shouldIgnoreDragStart(event.target, element)) {
          return;
        }

        event.preventDefault();
        setDraggingDocumentState(true);

        if (element.hasPointerCapture?.(event.pointerId) === false) {
          element.setPointerCapture?.(event.pointerId);
        }

        columnDragStateStore.setState({
          draggingColumnId: columnId,
          dropTargetColumnId: null,
          dropTargetEdge: null,
        });

        const updateFromPointer = (clientX: number, clientY: number) => {
          autoScrollBoardViewport(clientX);

          const target = getTouchDropTarget(clientX, clientY, columnId);

          if (!target) {
            clearDropTarget();

            return null;
          }

          updateDropTarget(target.columnId, target.edge);

          return target;
        };

        const cleanup = () => {
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          window.removeEventListener("pointercancel", handlePointerCancel);

          if (element.hasPointerCapture?.(event.pointerId)) {
            element.releasePointerCapture?.(event.pointerId);
          }

          setDraggingDocumentState(false);
        };

        const handlePointerMove = (moveEvent: PointerEvent) => {
          if (moveEvent.pointerId !== event.pointerId) {
            return;
          }

          moveEvent.preventDefault();
          updateFromPointer(moveEvent.clientX, moveEvent.clientY);
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
          if (upEvent.pointerId !== event.pointerId) {
            return;
          }

          const target = updateFromPointer(upEvent.clientX, upEvent.clientY);

          if (target) {
            const currentColumns = useStore.getState().columns;
            const startIndex = currentColumns.findIndex(
              (column) => column.id === columnId,
            );
            const indexOfTarget = currentColumns.findIndex(
              (column) => column.id === target.columnId,
            );

            if (startIndex >= 0 && indexOfTarget >= 0) {
              const finishIndex = getReorderDestinationIndex({
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget: target.edge,
                axis: "horizontal",
              });

              useStore.getState().moveColumn(columnId, finishIndex);
            }
          }

          cleanup();
          columnDragStateStore.reset();
        };

        const handlePointerCancel = (cancelEvent: PointerEvent) => {
          if (cancelEvent.pointerId !== event.pointerId) {
            return;
          }

          cleanup();
          columnDragStateStore.reset();
        };

        window.addEventListener("pointermove", handlePointerMove, {
          passive: false,
        });
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerCancel);
      };

      element.addEventListener("pointerdown", onPointerDown, {
        passive: false,
      });

      handleCleanupRef.current.set(columnId, () => {
        element.removeEventListener("pointerdown", onPointerDown);
      });
    },
    [
      autoScrollBoardViewport,
      clearDropTarget,
      getTouchDropTarget,
      updateDropTarget,
    ],
  );

  useEffect(() => {
    const cleanups = handleCleanupRef.current;

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups.clear();
      setDraggingDocumentState(false);
    };
  }, []);

  const contextValue = useMemo<ColumnDragAndDropContextValue>(
    () => ({
      registerColumnElement,
      registerColumnDragHandle,
    }),
    [registerColumnElement, registerColumnDragHandle],
  );

  return {
    boardViewportRef,
    contextValue,
  };
}

export function useColumnDropIndicatorEdge(columnId: string) {
  return useSyncExternalStore(
    columnDragStateStore.subscribe,
    () => {
      const dragState = columnDragStateStore.getSnapshot();

      return dragState.dropTargetColumnId === columnId
        ? dragState.dropTargetEdge
        : null;
    },
    () => null,
  );
}

export function useIsColumnDragging(columnId: string) {
  return useSyncExternalStore(
    columnDragStateStore.subscribe,
    () => columnDragStateStore.getSnapshot().draggingColumnId === columnId,
    () => false,
  );
}
