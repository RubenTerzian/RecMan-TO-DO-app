import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useStore } from "@/store/store";

type ColumnDragSnapshot = {
  draggingColumnId: string | null;
  draggingColumnTitle: string;
  draggingColumnWidth: number;
  draggingColumnHeight: number;
  /** Index where the dragged column would land in `state.columns`. */
  dropIndex: number | null;
};

type Listener = () => void;

export type ColumnDragAndDropContextValue = {
  registerColumnElement(columnId: string, element: HTMLElement | null): void;
  registerColumnDragHandle(columnId: string, element: HTMLElement | null): void;
  /** Track element registers as the horizontal hit-test surface. */
  registerColumnTrack(element: HTMLElement | null): void;
};

const DEFAULT_SNAPSHOT: ColumnDragSnapshot = {
  draggingColumnId: null,
  draggingColumnTitle: "",
  draggingColumnWidth: 0,
  draggingColumnHeight: 0,
  dropIndex: null,
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

function createColumnDragStore() {
  let state = DEFAULT_SNAPSHOT;
  const listeners = new Set<Listener>();

  return {
    getSnapshot() {
      return state;
    },
    reset() {
      if (state === DEFAULT_SNAPSHOT) {
        return;
      }

      state = DEFAULT_SNAPSHOT;
      listeners.forEach((listener) => listener());
    },
    setState(nextState: ColumnDragSnapshot) {
      if (
        state.draggingColumnId === nextState.draggingColumnId &&
        state.draggingColumnTitle === nextState.draggingColumnTitle &&
        state.draggingColumnWidth === nextState.draggingColumnWidth &&
        state.draggingColumnHeight === nextState.draggingColumnHeight &&
        state.dropIndex === nextState.dropIndex
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

const columnDragStore = createColumnDragStore();

/**
 * Pointer position store for the floating column ghost. Updated
 * imperatively from pointer events; ghost component reads it directly
 * and updates its own DOM transform without re-rendering React.
 */
type GhostPointer = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
};

const ghostPointer: GhostPointer = {
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  active: false,
};

const ghostListeners = new Set<Listener>();

function notifyGhostListeners() {
  ghostListeners.forEach((listener) => listener());
}

function setGhostPointer(next: Partial<GhostPointer>) {
  Object.assign(ghostPointer, next);
  notifyGhostListeners();
}

export function subscribeToColumnGhostPointer(listener: Listener) {
  ghostListeners.add(listener);

  return () => {
    ghostListeners.delete(listener);
  };
}

export function getColumnGhostPointerSnapshot() {
  return ghostPointer;
}

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
  const columnTrackRef = useRef<HTMLElement | null>(null);
  const handleCleanupRef = useRef(new Map<string, () => void>());
  const selectionModeRef = useRef(useStore.getState().selectionMode);

  // Auto-cancel any drag when entering selection mode.
  useEffect(() => {
    return useStore.subscribe((state) => {
      if (state.selectionMode === selectionModeRef.current) {
        return;
      }

      selectionModeRef.current = state.selectionMode;

      if (state.selectionMode) {
        columnDragStore.reset();
        setGhostPointer({ active: false });
        setDraggingDocumentState(false);
      }
    });
  }, []);

  /**
   * Compute the drop index based on the cursor X position over the
   * column track. The dragged column is treated as if it has been
   * removed from the list already, so indices are relative to the
   * filtered list.
   */
  const computeDropIndex = useCallback(
    (clientX: number, clientY: number, draggingColumnId: string) => {
      const track = columnTrackRef.current;

      if (!track) {
        return null;
      }

      const trackRect = track.getBoundingClientRect();

      if (clientY < trackRect.top || clientY > trackRect.bottom) {
        return null;
      }

      const orderedColumnIds = useStore
        .getState()
        .columns.map((column) => column.id)
        .filter((id) => id !== draggingColumnId);

      if (orderedColumnIds.length === 0) {
        return 0;
      }

      for (let index = 0; index < orderedColumnIds.length; index += 1) {
        const element = columnElementsRef.current.get(orderedColumnIds[index]);

        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const midpointX = rect.left + rect.width / 2;

        if (clientX < midpointX) {
          return index;
        }
      }

      return orderedColumnIds.length;
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

  const registerColumnTrack = useCallback((element: HTMLElement | null) => {
    columnTrackRef.current = element;
  }, []);

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

        const columnState = useStore
          .getState()
          .columns.find((column) => column.id === columnId);

        if (!columnState) {
          return;
        }

        event.preventDefault();

        if (element.hasPointerCapture?.(event.pointerId) === false) {
          element.setPointerCapture?.(event.pointerId);
        }

        const activationThreshold = 6;
        const dragStartX = event.clientX;
        const dragStartY = event.clientY;
        const columnElement =
          columnElementsRef.current.get(columnId) ?? element;
        const columnRect = columnElement.getBoundingClientRect();
        const grabOffsetX = dragStartX - columnRect.left;
        const grabOffsetY = dragStartY - columnRect.top;
        let isDragging = false;

        const startDragging = () => {
          if (isDragging) {
            return;
          }

          isDragging = true;
          setDraggingDocumentState(true);

          columnDragStore.setState({
            draggingColumnId: columnId,
            draggingColumnTitle: columnState.title,
            draggingColumnWidth: columnRect.width,
            draggingColumnHeight: columnRect.height,
            dropIndex: null,
          });

          setGhostPointer({
            x: dragStartX,
            y: dragStartY,
            offsetX: grabOffsetX,
            offsetY: grabOffsetY,
            active: true,
          });
        };

        const updateFromPointer = (clientX: number, clientY: number) => {
          startDragging();
          setGhostPointer({ x: clientX, y: clientY });
          autoScrollBoardViewport(clientX);

          const snapshot = columnDragStore.getSnapshot();
          const dropIndex = computeDropIndex(clientX, clientY, columnId);

          columnDragStore.setState({
            ...snapshot,
            dropIndex,
          });

          return dropIndex;
        };

        const cleanup = () => {
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          window.removeEventListener("pointercancel", handlePointerCancel);

          if (element.hasPointerCapture?.(event.pointerId)) {
            element.releasePointerCapture?.(event.pointerId);
          }

          if (isDragging) {
            setDraggingDocumentState(false);
          }
        };

        const finalizeDrop = (dropIndex: number | null) => {
          if (dropIndex === null) {
            return;
          }

          const orderedColumnIds = useStore
            .getState()
            .columns.map((column) => column.id);
          const startIndex = orderedColumnIds.indexOf(columnId);

          if (startIndex < 0) {
            return;
          }

          // dropIndex is relative to the list with the dragging column
          // already removed. Translate to the absolute index expected by
          // moveColumn (which works on the unfiltered list).
          const filteredIds = orderedColumnIds.filter((id) => id !== columnId);
          const clamped = Math.max(0, Math.min(dropIndex, filteredIds.length));
          const targetId =
            clamped < filteredIds.length ? filteredIds[clamped] : null;
          const finishIndex =
            targetId === null
              ? orderedColumnIds.length - 1
              : orderedColumnIds.indexOf(targetId) -
                (orderedColumnIds.indexOf(targetId) > startIndex ? 1 : 0);

          if (finishIndex === startIndex || finishIndex < 0) {
            return;
          }

          useStore.getState().moveColumn(columnId, finishIndex);
        };

        const handlePointerMove = (moveEvent: PointerEvent) => {
          if (moveEvent.pointerId !== event.pointerId) {
            return;
          }

          moveEvent.preventDefault();

          if (!isDragging) {
            const deltaX = moveEvent.clientX - dragStartX;
            const deltaY = moveEvent.clientY - dragStartY;

            if (Math.hypot(deltaX, deltaY) < activationThreshold) {
              return;
            }
          }

          updateFromPointer(moveEvent.clientX, moveEvent.clientY);
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
          if (upEvent.pointerId !== event.pointerId) {
            return;
          }

          if (!isDragging) {
            cleanup();

            return;
          }

          const dropIndex = updateFromPointer(upEvent.clientX, upEvent.clientY);

          finalizeDrop(dropIndex);
          cleanup();
          columnDragStore.reset();
          setGhostPointer({ active: false });
        };

        const handlePointerCancel = (cancelEvent: PointerEvent) => {
          if (cancelEvent.pointerId !== event.pointerId) {
            return;
          }

          cleanup();

          if (isDragging) {
            columnDragStore.reset();
            setGhostPointer({ active: false });
          }
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
    [autoScrollBoardViewport, computeDropIndex],
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
      registerColumnTrack,
    }),
    [registerColumnElement, registerColumnDragHandle, registerColumnTrack],
  );

  return {
    boardViewportRef,
    contextValue,
  };
}

/** Returns true while `columnId` is being dragged (used to hide the source). */
export function useIsColumnDragging(columnId: string) {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => columnDragStore.getSnapshot().draggingColumnId === columnId,
    () => false,
  );
}

/** Returns the currently dragging column id, or null when no drag is active. */
export function useDraggingColumnId() {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => columnDragStore.getSnapshot().draggingColumnId,
    () => null,
  );
}

type ColumnDropPlacement = {
  index: number;
  width: number;
  height: number;
};

const placementCache: { value: ColumnDropPlacement | null } = { value: null };

/**
 * Returns the placement of the column drop placeholder, or null when no
 * drag is in progress (or pointer is outside the column track). Cached
 * to keep identity stable across pointer moves that don't change values.
 */
export function useColumnDropPlacement(): ColumnDropPlacement | null {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => {
      const snapshot = columnDragStore.getSnapshot();

      if (snapshot.draggingColumnId === null || snapshot.dropIndex === null) {
        placementCache.value = null;

        return null;
      }

      const cached = placementCache.value;

      if (
        cached &&
        cached.index === snapshot.dropIndex &&
        cached.width === snapshot.draggingColumnWidth &&
        cached.height === snapshot.draggingColumnHeight
      ) {
        return cached;
      }

      const next: ColumnDropPlacement = {
        index: snapshot.dropIndex,
        width: snapshot.draggingColumnWidth,
        height: snapshot.draggingColumnHeight,
      };

      placementCache.value = next;

      return next;
    },
    () => null,
  );
}

type ColumnDragGhostSnapshot = {
  columnId: string;
  title: string;
  width: number;
  height: number;
} | null;

const columnGhostCache: { value: ColumnDragGhostSnapshot } = { value: null };

export function useColumnDragGhostSnapshot(): ColumnDragGhostSnapshot {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => {
      const snapshot = columnDragStore.getSnapshot();

      if (
        snapshot.draggingColumnId === null ||
        snapshot.draggingColumnWidth === 0
      ) {
        columnGhostCache.value = null;

        return null;
      }

      const cached = columnGhostCache.value;

      if (
        cached &&
        cached.columnId === snapshot.draggingColumnId &&
        cached.title === snapshot.draggingColumnTitle &&
        cached.width === snapshot.draggingColumnWidth &&
        cached.height === snapshot.draggingColumnHeight
      ) {
        return cached;
      }

      const next: ColumnDragGhostSnapshot = {
        columnId: snapshot.draggingColumnId,
        title: snapshot.draggingColumnTitle,
        width: snapshot.draggingColumnWidth,
        height: snapshot.draggingColumnHeight,
      };

      columnGhostCache.value = next;

      return next;
    },
    () => null,
  );
}
