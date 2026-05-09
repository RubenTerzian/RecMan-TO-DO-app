import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { useStore } from "@/store/store";
import { selectMoveColumn } from "@/store/selectors";

type ColumnSummary = {
  id: string;
  title: string;
};

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

type UseColumnDragAndDropOptions = {
  columns: ColumnSummary[];
  selectionMode: boolean;
};

type Listener = () => void;

const DEFAULT_DRAG_STATE: ColumnDragState = {
  draggingColumnId: null,
  dropTargetColumnId: null,
  dropTargetEdge: null,
};

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

function setDraggingDocumentState(isDragging: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.cursor = isDragging ? "grabbing" : "";
  document.body.style.userSelect = isDragging ? "none" : "";
}

export function useColumnDragAndDrop({
  columns,
  selectionMode,
}: UseColumnDragAndDropOptions) {
  const moveColumn = useStore(selectMoveColumn);
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const columnElementsRef = useRef(new Map<string, HTMLElement>());
  const dragHandleElementsRef = useRef(new Map<string, HTMLElement>());

  const columnIdOrder = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );

  const getTouchDropTarget = useCallback(
    (
      clientX: number,
      clientY: number,
      draggingColumnId: string,
    ): TouchColumnDropTarget | null => {
      for (const columnId of columnIdOrder) {
        if (columnId === draggingColumnId) {
          continue;
        }

        const element = columnElementsRef.current.get(columnId);

        if (!element) {
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
    [columnIdOrder],
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

  const setColumnElement = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        columnElementsRef.current.delete(columnId);

        return;
      }

      columnElementsRef.current.set(columnId, element);
    },
    [],
  );

  const setColumnDragHandle = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        dragHandleElementsRef.current.delete(columnId);

        return;
      }

      dragHandleElementsRef.current.set(columnId, element);
    },
    [],
  );

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

  useEffect(() => {
    if (selectionMode) {
      columnDragStateStore.reset();
      setDraggingDocumentState(false);

      return;
    }

    const handleCleanups = columnIdOrder.flatMap((columnId) => {
      const handleElement = dragHandleElementsRef.current.get(columnId);

      if (!handleElement) {
        return [];
      }

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        event.preventDefault();
        setDraggingDocumentState(true);

        if (handleElement.hasPointerCapture?.(event.pointerId) === false) {
          handleElement.setPointerCapture?.(event.pointerId);
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

          if (handleElement.hasPointerCapture?.(event.pointerId)) {
            handleElement.releasePointerCapture?.(event.pointerId);
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
            const startIndex = columnIdOrder.indexOf(columnId);
            const indexOfTarget = columnIdOrder.indexOf(target.columnId);

            if (startIndex >= 0 && indexOfTarget >= 0) {
              const finishIndex = getReorderDestinationIndex({
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget: target.edge,
                axis: "horizontal",
              });

              moveColumn(columnId, finishIndex);
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

      handleElement.addEventListener("pointerdown", onPointerDown, {
        passive: false,
      });

      return [
        () => handleElement.removeEventListener("pointerdown", onPointerDown),
      ];
    });

    return () => {
      handleCleanups.forEach((cleanup) => cleanup());
      setDraggingDocumentState(false);
    };
  }, [
    autoScrollBoardViewport,
    clearDropTarget,
    columnIdOrder,
    getTouchDropTarget,
    moveColumn,
    selectionMode,
    updateDropTarget,
  ]);

  return {
    boardViewportRef,
    setColumnDragHandle,
    setColumnElement,
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
