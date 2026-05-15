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
import { columnGhostNodeSlot } from "@/features/ColumnsGrid/dnd/ghostNodeSlot";
import { createDragStateStore } from "@/features/ColumnsGrid/dnd/createDragStateStore";
import { createPointerDragSession } from "@/features/ColumnsGrid/dnd/createPointerDragSession";
import { createGhostPointerStore } from "@/features/ColumnsGrid/dnd/ghostPointerStore";
import { setDraggingDocumentState } from "@/features/ColumnsGrid/dnd/pointerDragActivation";

/**
 * Raw drag fields written by pointer handlers. Derived projections
 * (`ghost`, `placement`) are computed from these and stored alongside
 * them in the snapshot for stable references without any module-level
 * cache.
 */
type ColumnDragRaw = {
  draggingColumnId: string | null;
  draggingColumnWidth: number;
  draggingColumnHeight: number;
  /** Index where the dragged column would land in the filtered list. */
  dropIndex: number | null;
};

type ColumnDragGhost = {
  columnId: string;
  width: number;
  height: number;
};

type ColumnDropPlacement = {
  index: number;
  width: number;
  height: number;
};

type ColumnDragSnapshot = ColumnDragRaw & {
  /** Stable while geometry is unchanged; null when no drag is active. */
  ghost: ColumnDragGhost | null;
  /** Stable while geometry/index are unchanged; null when no drag is active. */
  placement: ColumnDropPlacement | null;
};

export type ColumnDragAndDropContextValue = {
  registerColumnElement(columnId: string, element: HTMLElement | null): void;
  registerColumnDragHandle(columnId: string, element: HTMLElement | null): void;
  /** Track element registers as the horizontal hit-test surface. */
  registerColumnTrack(element: HTMLElement | null): void;
};

const DEFAULT_RAW: ColumnDragRaw = {
  draggingColumnId: null,
  draggingColumnWidth: 0,
  draggingColumnHeight: 0,
  dropIndex: null,
};

const DEFAULT_SNAPSHOT: ColumnDragSnapshot = {
  ...DEFAULT_RAW,
  ghost: null,
  placement: null,
};

function equalsColumnDragSnapshot(
  a: ColumnDragSnapshot,
  b: ColumnDragSnapshot,
) {
  return (
    a.draggingColumnId === b.draggingColumnId &&
    a.draggingColumnWidth === b.draggingColumnWidth &&
    a.draggingColumnHeight === b.draggingColumnHeight &&
    a.dropIndex === b.dropIndex
  );
}

function deriveGhost(
  previous: ColumnDragGhost | null,
  raw: ColumnDragRaw,
): ColumnDragGhost | null {
  if (raw.draggingColumnId === null || raw.draggingColumnWidth === 0) {
    return null;
  }

  if (
    previous &&
    previous.columnId === raw.draggingColumnId &&
    previous.width === raw.draggingColumnWidth &&
    previous.height === raw.draggingColumnHeight
  ) {
    return previous;
  }

  return {
    columnId: raw.draggingColumnId,
    width: raw.draggingColumnWidth,
    height: raw.draggingColumnHeight,
  };
}

function derivePlacement(
  previous: ColumnDropPlacement | null,
  raw: ColumnDragRaw,
): ColumnDropPlacement | null {
  if (raw.draggingColumnId === null || raw.dropIndex === null) {
    return null;
  }

  if (
    previous &&
    previous.index === raw.dropIndex &&
    previous.width === raw.draggingColumnWidth &&
    previous.height === raw.draggingColumnHeight
  ) {
    return previous;
  }

  return {
    index: raw.dropIndex,
    width: raw.draggingColumnWidth,
    height: raw.draggingColumnHeight,
  };
}

const columnDragStateStore = createDragStateStore<ColumnDragSnapshot>(
  DEFAULT_SNAPSHOT,
  equalsColumnDragSnapshot,
);

function setColumnDragRaw(raw: ColumnDragRaw) {
  const previous = columnDragStateStore.getSnapshot();
  columnDragStateStore.setState({
    ...raw,
    ghost: deriveGhost(previous.ghost, raw),
    placement: derivePlacement(previous.placement, raw),
  });
}

const columnDragStore = {
  getSnapshot: columnDragStateStore.getSnapshot,
  subscribe: columnDragStateStore.subscribe,
  reset: columnDragStateStore.reset,
  setRaw: setColumnDragRaw,
};

/**
 * Pointer position store for the floating column ghost. Same pattern as
 * the task ghost store: read directly by the ghost component which
 * mutates its own DOM transform, never re-rendering React.
 */
const columnGhostPointerStore = createGhostPointerStore();

const setGhostPointer = columnGhostPointerStore.setPointer;

export const subscribeToColumnGhostPointer = columnGhostPointerStore.subscribe;
export const getColumnGhostPointerSnapshot =
  columnGhostPointerStore.getSnapshot;

export const ColumnDragAndDropContext =
  createContext<ColumnDragAndDropContextValue | null>(null);

export function useColumnDragAndDropContext() {
  const context = useContext(ColumnDragAndDropContext);

  if (!context) {
    throw new Error("Column drag-and-drop context is not available.");
  }

  return context;
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
        columnGhostNodeSlot.set(null);
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
        const columnState = useStore
          .getState()
          .columns.find((column) => column.id === columnId);

        if (!columnState) {
          return;
        }

        const columnElement =
          columnElementsRef.current.get(columnId) ?? element;
        const columnRect = columnElement.getBoundingClientRect();
        const grabOffsetX = event.clientX - columnRect.left;
        const grabOffsetY = event.clientY - columnRect.top;
        // Pre-drag track height — locked while the drag is active so
        // the grid track does not collapse to the height of the
        // remaining (shorter) columns when the dragged column is
        // filtered out of the visible track.
        let lockedTrackHeight: number | null = null;

        const updateFromPointer = (clientX: number, clientY: number) => {
          setGhostPointer({ x: clientX, y: clientY });
          autoScrollBoardViewport(clientX);

          const dropIndex = computeDropIndex(clientX, clientY, columnId);

          columnDragStore.setRaw({
            ...columnDragStore.getSnapshot(),
            dropIndex,
          });

          return dropIndex;
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
          // removed. Translate to the absolute index expected by
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

        createPointerDragSession({
          handleElement: element,
          pointerDownEvent: event,
          canStart: () => !selectionModeRef.current,
          onActivate: ({ clientX, clientY }) => {
            const track = columnTrackRef.current;

            if (track) {
              lockedTrackHeight = track.getBoundingClientRect().height;
              track.style.minHeight = `${lockedTrackHeight}px`;
            }

            // Snapshot a pixel-perfect copy of the source column for
            // the floating ghost. cloneNode does NOT clone listeners.
            const sourceClone = columnElement.cloneNode(true) as HTMLElement;

            sourceClone.style.width = `${columnRect.width}px`;
            sourceClone.style.height = `${columnRect.height}px`;
            columnGhostNodeSlot.set(sourceClone);

            columnDragStore.setRaw({
              draggingColumnId: columnId,
              draggingColumnWidth: columnRect.width,
              draggingColumnHeight: columnRect.height,
              dropIndex: null,
            });

            setGhostPointer({
              x: clientX,
              y: clientY,
              offsetX: grabOffsetX,
              offsetY: grabOffsetY,
              active: true,
            });
          },
          onMove: ({ clientX, clientY }) => {
            updateFromPointer(clientX, clientY);
          },
          onCommit: ({ clientX, clientY }) => {
            const dropIndex = updateFromPointer(clientX, clientY);
            finalizeDrop(dropIndex);
          },
          onCleanup: () => {
            const track = columnTrackRef.current;

            if (track && lockedTrackHeight !== null) {
              track.style.minHeight = "";
              lockedTrackHeight = null;
            }

            columnGhostNodeSlot.set(null);
            columnDragStore.reset();
            setGhostPointer({ active: false });
          },
        });
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

/** Returns the currently dragging column id, or null when no drag is active. */
export function useDraggingColumnId() {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => columnDragStore.getSnapshot().draggingColumnId,
    () => null,
  );
}

/**
 * Returns the column drop placeholder placement, or null when no drag
 * is in progress (or the pointer is outside the column track).
 * Identity is stable across pointer moves; cache lives in the snapshot.
 */
export function useColumnDropPlacement(): ColumnDropPlacement | null {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => columnDragStore.getSnapshot().placement,
    () => null,
  );
}

export function useColumnDragGhostSnapshot(): ColumnDragGhost | null {
  return useSyncExternalStore(
    columnDragStore.subscribe,
    () => columnDragStore.getSnapshot().ghost,
    () => null,
  );
}
