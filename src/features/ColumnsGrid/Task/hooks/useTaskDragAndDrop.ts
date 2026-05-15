import type { RefObject } from "react";
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
import { taskGhostNodeSlot } from "@/features/ColumnsGrid/dnd/ghostNodeSlot";
import { createDragStateStore } from "@/features/ColumnsGrid/dnd/createDragStateStore";
import { createPointerDragSession } from "@/features/ColumnsGrid/dnd/createPointerDragSession";
import { createGhostPointerStore } from "@/features/ColumnsGrid/dnd/ghostPointerStore";
import { setDraggingDocumentState } from "@/features/ColumnsGrid/dnd/pointerDragActivation";

type TaskDropTarget = {
  columnId: string;
  /** Index in this column's task list where the dragged task would land. */
  index: number;
};

/**
 * Raw drag fields written by pointer handlers. Derived projections
 * (`ghost`, `placement`) are computed from these and stored alongside
 * them in the snapshot so React subscribers get stable references
 * without any module-level cache.
 */
type TaskDragRaw = {
  draggingTaskId: string | null;
  draggingTaskHeight: number;
  draggingTaskWidth: number;
  /** Original column of the dragged task. */
  sourceColumnId: string | null;
  previewColumnId: string | null;
  previewIndex: number | null;
};

type TaskDragGhost = {
  taskId: string;
  width: number;
  height: number;
};

type TaskDropPlacement = {
  index: number;
  height: number;
  width: number;
};

type TaskDragSnapshot = TaskDragRaw & {
  /** Stable while geometry is unchanged; null when no drag is active. */
  ghost: TaskDragGhost | null;
  /**
   * Stable while geometry is unchanged. Bound to `previewColumnId`,
   * so per-column hooks check `previewColumnId === columnId` before
   * returning it.
   */
  placement: TaskDropPlacement | null;
};

export type TaskDragAndDropContextValue = {
  registerColumnDropZone(columnId: string, element: HTMLElement | null): void;
  registerTaskDragHandle(taskId: string, element: HTMLElement | null): void;
  registerTaskElement(taskId: string, element: HTMLElement | null): void;
};

type UseTaskDragAndDropOptions = {
  boardViewportRef: RefObject<HTMLDivElement | null>;
};

const DEFAULT_RAW: TaskDragRaw = {
  draggingTaskId: null,
  draggingTaskHeight: 0,
  draggingTaskWidth: 0,
  sourceColumnId: null,
  previewColumnId: null,
  previewIndex: null,
};

const DEFAULT_SNAPSHOT: TaskDragSnapshot = {
  ...DEFAULT_RAW,
  ghost: null,
  placement: null,
};

function equalsTaskDragSnapshot(a: TaskDragSnapshot, b: TaskDragSnapshot) {
  return (
    a.draggingTaskId === b.draggingTaskId &&
    a.draggingTaskHeight === b.draggingTaskHeight &&
    a.draggingTaskWidth === b.draggingTaskWidth &&
    a.sourceColumnId === b.sourceColumnId &&
    a.previewColumnId === b.previewColumnId &&
    a.previewIndex === b.previewIndex
  );
}

function deriveGhost(
  previous: TaskDragGhost | null,
  raw: TaskDragRaw,
): TaskDragGhost | null {
  if (raw.draggingTaskId === null || raw.draggingTaskHeight === 0) {
    return null;
  }

  if (
    previous &&
    previous.taskId === raw.draggingTaskId &&
    previous.width === raw.draggingTaskWidth &&
    previous.height === raw.draggingTaskHeight
  ) {
    return previous;
  }

  return {
    taskId: raw.draggingTaskId,
    width: raw.draggingTaskWidth,
    height: raw.draggingTaskHeight,
  };
}

function derivePlacement(
  previous: TaskDropPlacement | null,
  raw: TaskDragRaw,
): TaskDropPlacement | null {
  if (raw.previewColumnId === null || raw.previewIndex === null) {
    return null;
  }

  if (
    previous &&
    previous.index === raw.previewIndex &&
    previous.height === raw.draggingTaskHeight &&
    previous.width === raw.draggingTaskWidth
  ) {
    return previous;
  }

  return {
    index: raw.previewIndex,
    height: raw.draggingTaskHeight,
    width: raw.draggingTaskWidth,
  };
}

const taskDragStateStore = createDragStateStore<TaskDragSnapshot>(
  DEFAULT_SNAPSHOT,
  equalsTaskDragSnapshot,
);

/**
 * Apply a raw update; derived projections are recomputed and reused
 * by reference when their inputs are unchanged.
 */
function setTaskDragRaw(raw: TaskDragRaw) {
  const previous = taskDragStateStore.getSnapshot();
  taskDragStateStore.setState({
    ...raw,
    ghost: deriveGhost(previous.ghost, raw),
    placement: derivePlacement(previous.placement, raw),
  });
}

const taskDragStore = {
  getSnapshot: taskDragStateStore.getSnapshot,
  subscribe: taskDragStateStore.subscribe,
  reset: taskDragStateStore.reset,
  setRaw: setTaskDragRaw,
};

/**
 * Pointer position store for the drag ghost. Updated imperatively from
 * pointer events. The ghost component reads it directly and mutates its
 * own DOM transform, so pointer movement never re-renders React.
 */
const ghostPointerStore = createGhostPointerStore();

const setGhostPointer = ghostPointerStore.setPointer;

export const subscribeToGhostPointer = ghostPointerStore.subscribe;
export const getGhostPointerSnapshot = ghostPointerStore.getSnapshot;

export const TaskDragAndDropContext =
  createContext<TaskDragAndDropContextValue | null>(null);

export function useTaskDragAndDropContext() {
  const context = useContext(TaskDragAndDropContext);

  if (!context) {
    throw new Error("Task drag-and-drop context is not available.");
  }

  return context;
}

type ColumnRect = {
  columnId: string;
  rect: DOMRect;
};

export function useTaskDragAndDrop({
  boardViewportRef,
}: UseTaskDragAndDropOptions): TaskDragAndDropContextValue {
  const tasksRef = useRef(useStore.getState().tasks);
  const selectionModeRef = useRef(useStore.getState().selectionMode);
  const taskElementsRef = useRef(new Map<string, HTMLElement>());
  const taskDragHandleElementsRef = useRef(new Map<string, HTMLElement>());
  const columnDropZonesRef = useRef(new Map<string, HTMLElement>());
  const taskHandleCleanupRef = useRef(new Map<string, () => void>());

  useEffect(() => {
    return useStore.subscribe((state) => {
      tasksRef.current = state.tasks;

      if (state.selectionMode !== selectionModeRef.current) {
        selectionModeRef.current = state.selectionMode;

        if (state.selectionMode) {
          taskDragStore.reset();
          taskGhostNodeSlot.set(null);
          setGhostPointer({ active: false });
          setDraggingDocumentState(false);
        }
      }
    });
  }, []);

  /**
   * Find which column the pointer is over. We allow a generous vertical
   * tolerance beyond the column's actual rect so the user can still
   * target the bottom of a column on mobile, where the column's
   * `max-height` typically ends well above the viewport bottom and the
   * finger physically blocks the last few drop slots.
   */
  const getColumnAtPoint = useCallback(
    (clientX: number, clientY: number, isTouch: boolean): ColumnRect | null => {
      const verticalTolerance = isTouch ? 200 : 60;

      for (const [columnId, element] of columnDropZonesRef.current.entries()) {
        const rect = element.getBoundingClientRect();

        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top - verticalTolerance &&
          clientY <= rect.bottom + verticalTolerance
        ) {
          return { columnId, rect };
        }
      }

      return null;
    },
    [],
  );

  /**
   * Compute the drop index inside a column based on cursor Y. Excludes
   * the dragged task from the candidate list (we treat the dragged card
   * as if it has been removed from the column already).
   */
  const computeDropIndexForColumn = useCallback(
    (columnId: string, clientY: number, draggingTaskId: string) => {
      const tasksInColumn = tasksRef.current.filter(
        (task) => task.columnId === columnId && task.id !== draggingTaskId,
      );

      if (tasksInColumn.length === 0) {
        return 0;
      }

      for (let index = 0; index < tasksInColumn.length; index += 1) {
        const element = taskElementsRef.current.get(tasksInColumn[index].id);

        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const midpointY = rect.top + rect.height / 2;

        if (clientY < midpointY) {
          return index;
        }
      }

      return tasksInColumn.length;
    },
    [],
  );

  const autoScrollForPointerPoint = useCallback(
    (clientX: number, clientY: number, currentColumn: ColumnRect | null) => {
      const boardViewport = boardViewportRef.current;

      if (boardViewport) {
        const rect = boardViewport.getBoundingClientRect();
        const horizontalThreshold = 56;
        const horizontalScrollStep = 18;

        if (clientX <= rect.left + horizontalThreshold) {
          boardViewport.scrollBy({ left: -horizontalScrollStep });
        } else if (clientX >= rect.right - horizontalThreshold) {
          boardViewport.scrollBy({ left: horizontalScrollStep });
        }
      }

      // Auto-scroll the document when the pointer is near the viewport
      // top/bottom. On mobile the page itself is the vertical scroller
      // (column max-height ends above the viewport bottom), so without
      // this the user has no way to reach drop slots near the bottom of
      // a tall column — their finger physically blocks the area.
      if (typeof window !== "undefined") {
        const verticalEdgeThreshold = 80;
        const verticalEdgeStep = 18;
        const viewportHeight = window.innerHeight;
        const documentScroller =
          document.scrollingElement ?? document.documentElement;

        if (clientY <= verticalEdgeThreshold) {
          documentScroller.scrollBy({ top: -verticalEdgeStep });
        } else if (clientY >= viewportHeight - verticalEdgeThreshold) {
          documentScroller.scrollBy({ top: verticalEdgeStep });
        }
      }

      if (!currentColumn) {
        return;
      }

      const dropZone = columnDropZonesRef.current.get(currentColumn.columnId);

      if (!dropZone) {
        return;
      }

      const verticalThreshold = 48;
      const verticalScrollStep = 16;
      const rect = dropZone.getBoundingClientRect();

      if (clientY <= rect.top + verticalThreshold) {
        dropZone.scrollBy({ top: -verticalScrollStep });
      } else if (clientY >= rect.bottom - verticalThreshold) {
        dropZone.scrollBy({ top: verticalScrollStep });
      }
    },
    [boardViewportRef],
  );

  const registerTaskElement = useCallback(
    (taskId: string, element: HTMLElement | null) => {
      if (!element) {
        taskElementsRef.current.delete(taskId);

        return;
      }

      taskElementsRef.current.set(taskId, element);
    },
    [],
  );

  const registerColumnDropZone = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        columnDropZonesRef.current.delete(columnId);

        return;
      }

      columnDropZonesRef.current.set(columnId, element);
    },
    [],
  );

  const registerTaskDragHandle = useCallback(
    (taskId: string, element: HTMLElement | null) => {
      taskHandleCleanupRef.current.get(taskId)?.();
      taskHandleCleanupRef.current.delete(taskId);

      if (!element) {
        taskDragHandleElementsRef.current.delete(taskId);

        return;
      }

      taskDragHandleElementsRef.current.set(taskId, element);

      const onPointerDown = (event: PointerEvent) => {
        const currentTask = tasksRef.current.find((task) => task.id === taskId);

        if (!currentTask) {
          return;
        }

        const isTouch = event.pointerType === "touch";
        const taskElement =
          taskElementsRef.current.get(currentTask.id) ?? element;
        const cardRect = taskElement.getBoundingClientRect();
        const grabOffsetX = event.clientX - cardRect.left;
        const grabOffsetY = event.clientY - cardRect.top;

        const updateFromPointer = (clientX: number, clientY: number) => {
          // Move the ghost first so it follows the cursor smoothly.
          setGhostPointer({ x: clientX, y: clientY });

          const columnAtPoint = getColumnAtPoint(clientX, clientY, isTouch);

          autoScrollForPointerPoint(clientX, clientY, columnAtPoint);

          const snapshot = taskDragStore.getSnapshot();

          if (!columnAtPoint) {
            taskDragStore.setRaw({
              draggingTaskId: snapshot.draggingTaskId,
              draggingTaskHeight: snapshot.draggingTaskHeight,
              draggingTaskWidth: snapshot.draggingTaskWidth,
              sourceColumnId: snapshot.sourceColumnId,
              previewColumnId: null,
              previewIndex: null,
            });

            return null;
          }

          const dropIndex = computeDropIndexForColumn(
            columnAtPoint.columnId,
            clientY,
            currentTask.id,
          );

          taskDragStore.setRaw({
            draggingTaskId: snapshot.draggingTaskId,
            draggingTaskHeight: snapshot.draggingTaskHeight,
            draggingTaskWidth: snapshot.draggingTaskWidth,
            sourceColumnId: snapshot.sourceColumnId,
            previewColumnId: columnAtPoint.columnId,
            previewIndex: dropIndex,
          });

          return { columnId: columnAtPoint.columnId, index: dropIndex };
        };

        const finalizeDrop = (target: TaskDropTarget | null) => {
          if (!target) {
            return;
          }

          const tasksInTargetColumn = useStore
            .getState()
            .tasks.filter(
              (task) =>
                task.columnId === target.columnId && task.id !== currentTask.id,
            );

          if (tasksInTargetColumn.length === 0) {
            useStore.getState().moveTask(currentTask.id, {
              columnId: target.columnId,
            });

            return;
          }

          const clampedIndex = Math.max(
            0,
            Math.min(target.index, tasksInTargetColumn.length),
          );

          if (clampedIndex >= tasksInTargetColumn.length) {
            const last = tasksInTargetColumn[tasksInTargetColumn.length - 1];

            useStore.getState().moveTask(currentTask.id, {
              columnId: target.columnId,
              targetTaskId: last.id,
              position: "after",
            });

            return;
          }

          const targetTask = tasksInTargetColumn[clampedIndex];

          useStore.getState().moveTask(currentTask.id, {
            columnId: target.columnId,
            targetTaskId: targetTask.id,
            position: "before",
          });
        };

        createPointerDragSession({
          handleElement: element,
          pointerDownEvent: event,
          canStart: () => !selectionModeRef.current,
          onActivate: ({ clientX, clientY }) => {
            // Snapshot a pixel-perfect copy of the source card for the
            // floating ghost. cloneNode does NOT clone listeners.
            const sourceClone = taskElement.cloneNode(true) as HTMLElement;

            sourceClone.style.width = `${cardRect.width}px`;
            sourceClone.style.height = `${cardRect.height}px`;
            taskGhostNodeSlot.set(sourceClone);

            taskDragStore.setRaw({
              draggingTaskId: currentTask.id,
              draggingTaskHeight: cardRect.height,
              draggingTaskWidth: cardRect.width,
              sourceColumnId: currentTask.columnId,
              previewColumnId: currentTask.columnId,
              previewIndex: null,
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
            const target = updateFromPointer(clientX, clientY);
            finalizeDrop(target);
          },
          onCleanup: () => {
            taskGhostNodeSlot.set(null);
            taskDragStore.reset();
            setGhostPointer({ active: false });
          },
        });
      };

      element.addEventListener("pointerdown", onPointerDown, {
        passive: false,
      });

      taskHandleCleanupRef.current.set(taskId, () => {
        element.removeEventListener("pointerdown", onPointerDown);
      });
    },
    [autoScrollForPointerPoint, computeDropIndexForColumn, getColumnAtPoint],
  );

  useEffect(() => {
    const taskHandleCleanupMap = taskHandleCleanupRef.current;

    return () => {
      taskHandleCleanupMap.forEach((cleanup) => cleanup());
      taskHandleCleanupMap.clear();
      setDraggingDocumentState(false);
    };
  }, []);

  return useMemo(
    () => ({
      registerColumnDropZone,
      registerTaskDragHandle,
      registerTaskElement,
    }),
    [registerColumnDropZone, registerTaskDragHandle, registerTaskElement],
  );
}

/** Returns the dragging task id, or `null` when no drag is in progress. */
export function useDraggingTaskId() {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => taskDragStore.getSnapshot().draggingTaskId,
    () => null,
  );
}

/**
 * Returns the column id the dragged task originated from, or `null` when
 * no task drag is in progress. Used by the source column to suppress its
 * empty-state messaging while the placeholder represents the held card.
 */
export function useDragSourceColumnId() {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => taskDragStore.getSnapshot().sourceColumnId,
    () => null,
  );
}

/**
 * Returns true when this column is the active drop-target column.
 * Used to highlight the column visually.
 */
export function useIsColumnDropTarget(columnId: string) {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => taskDragStore.getSnapshot().previewColumnId === columnId,
    () => false,
  );
}

/**
 * Returns the placement of the drop placeholder inside this column, or
 * `null` when this column is not the active drop target. Identity is
 * stable across pointer moves that don't change geometry — the cache
 * lives inside the snapshot, not in a module-level Map.
 */
export function useColumnDropPlacement(
  columnId: string,
): TaskDropPlacement | null {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => {
      const snapshot = taskDragStore.getSnapshot();
      return snapshot.previewColumnId === columnId ? snapshot.placement : null;
    },
    () => null,
  );
}

/**
 * Snapshot consumed by the floating ghost component. Position is
 * intentionally excluded — the ghost reads pointer position
 * imperatively and never re-renders during pointer movement.
 */
export function useDragGhostSnapshot(): TaskDragGhost | null {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => taskDragStore.getSnapshot().ghost,
    () => null,
  );
}
