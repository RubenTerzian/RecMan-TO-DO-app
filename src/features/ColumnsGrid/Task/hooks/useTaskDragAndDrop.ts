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
import {
  MOUSE_ACTIVATION_PIXELS,
  TOUCH_LONG_PRESS_MS,
  TOUCH_PRE_ACTIVATION_CANCEL_PIXELS,
  isPointerOnDragHandle,
  setDraggingDocumentState,
  shouldIgnoreDragStart,
} from "@/features/ColumnsGrid/dnd/pointerDragActivation";

type TaskDropTarget = {
  columnId: string;
  /** Index in this column's task list where the dragged task would land. */
  index: number;
};

type TaskDragSnapshot = {
  draggingTaskId: string | null;
  draggingTaskHeight: number;
  draggingTaskWidth: number;
  /** Original column of the dragged task. */
  sourceColumnId: string | null;
  previewColumnId: string | null;
  previewIndex: number | null;
};

export type TaskDragAndDropContextValue = {
  registerColumnDropZone(columnId: string, element: HTMLElement | null): void;
  registerTaskDragHandle(taskId: string, element: HTMLElement | null): void;
  registerTaskElement(taskId: string, element: HTMLElement | null): void;
};

type UseTaskDragAndDropOptions = {
  boardViewportRef: RefObject<HTMLDivElement | null>;
};

type Listener = () => void;

const DEFAULT_SNAPSHOT: TaskDragSnapshot = {
  draggingTaskId: null,
  draggingTaskHeight: 0,
  draggingTaskWidth: 0,
  sourceColumnId: null,
  previewColumnId: null,
  previewIndex: null,
};

function createTaskDragStore() {
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
    setState(nextState: TaskDragSnapshot) {
      if (
        state.draggingTaskId === nextState.draggingTaskId &&
        state.draggingTaskHeight === nextState.draggingTaskHeight &&
        state.draggingTaskWidth === nextState.draggingTaskWidth &&
        state.sourceColumnId === nextState.sourceColumnId &&
        state.previewColumnId === nextState.previewColumnId &&
        state.previewIndex === nextState.previewIndex
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

const taskDragStore = createTaskDragStore();

/**
 * Pointer position store for the drag ghost. Updated imperatively from
 * pointer events. The ghost component reads it directly and mutates its
 * own DOM transform, so pointer movement never re-renders React.
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

function setGhostPointer(next: Partial<GhostPointer>) {
  Object.assign(ghostPointer, next);
  ghostListeners.forEach((listener) => listener());
}

export function subscribeToGhostPointer(listener: Listener) {
  ghostListeners.add(listener);

  return () => {
    ghostListeners.delete(listener);
  };
}

export function getGhostPointerSnapshot() {
  return ghostPointer;
}

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
        const documentScroller = document.scrollingElement ?? document.documentElement;

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
        if (selectionModeRef.current) {
          return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        const isTouch = event.pointerType === "touch";

        // Skip drag start when the user is interacting with a real
        // control inside the card (checkbox, edit/delete buttons, etc.).
        if (shouldIgnoreDragStart(event.target, element)) {
          return;
        }

        const currentTask = tasksRef.current.find((task) => task.id === taskId);

        if (!currentTask) {
          return;
        }

        const dragStartX = event.clientX;
        const dragStartY = event.clientY;
        const taskElement =
          taskElementsRef.current.get(currentTask.id) ?? element;
        const cardRect = taskElement.getBoundingClientRect();
        const grabOffsetX = dragStartX - cardRect.left;
        const grabOffsetY = dragStartY - cardRect.top;
        let isDragging = false;
        let touchActivationTimerId: number | null = null;

        // For mouse / pen, always preventDefault to suppress text
        // selection and the OS callout. For touch we may only do it on
        // a real drag handle (which sets `touch-action: none`); on the
        // rest of the card the browser must keep the gesture so it can
        // still scroll the column or the page if the user moves before
        // the long-press timer fires.
        if (!isTouch || isPointerOnDragHandle(event.target, element)) {
          event.preventDefault();
        }

        const startDragging = () => {
          if (isDragging) {
            return;
          }

          isDragging = true;
          setDraggingDocumentState(true);

          if (element.hasPointerCapture?.(event.pointerId) === false) {
            element.setPointerCapture?.(event.pointerId);
          }

          // Snapshot a pixel-perfect copy of the source card for the
          // floating ghost. cloneNode does NOT clone event listeners.
          const sourceClone = taskElement.cloneNode(true) as HTMLElement;

          // Lock the clone to its source dimensions so layout doesn't
          // collapse when we lift it out of its parent.
          sourceClone.style.width = `${cardRect.width}px`;
          sourceClone.style.height = `${cardRect.height}px`;
          taskGhostNodeSlot.set(sourceClone);

          taskDragStore.setState({
            draggingTaskId: currentTask.id,
            draggingTaskHeight: cardRect.height,
            draggingTaskWidth: cardRect.width,
            sourceColumnId: currentTask.columnId,
            previewColumnId: currentTask.columnId,
            previewIndex: null,
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
          // Always move the ghost first so it follows the cursor smoothly.
          setGhostPointer({ x: clientX, y: clientY });

          const columnAtPoint = getColumnAtPoint(clientX, clientY, isTouch);

          autoScrollForPointerPoint(clientX, clientY, columnAtPoint);

          const snapshot = taskDragStore.getSnapshot();

          if (!columnAtPoint) {
            taskDragStore.setState({
              ...snapshot,
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

          taskDragStore.setState({
            ...snapshot,
            previewColumnId: columnAtPoint.columnId,
            previewIndex: dropIndex,
          });

          return { columnId: columnAtPoint.columnId, index: dropIndex };
        };

        const cancelTouchActivation = () => {
          if (touchActivationTimerId !== null) {
            window.clearTimeout(touchActivationTimerId);
            touchActivationTimerId = null;
          }
        };

        const cleanupPointerSession = () => {
          cancelTouchActivation();
          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
          window.removeEventListener("pointercancel", handlePointerCancel);
          window.removeEventListener("contextmenu", handleContextMenu, true);

          if (element.hasPointerCapture?.(event.pointerId)) {
            element.releasePointerCapture?.(event.pointerId);
          }

          // Always reset the document/body state. If we only reset when
          // `isDragging` was true, an OS-hijacked gesture could leave
          // the page with `userSelect: none` and a grabbing cursor,
          // which on mobile manifests as broken scrolling.
          setDraggingDocumentState(false);

          // Drop any in-flight ghost / drag-store snapshot so the UI
          // can never get stuck in a half-drag state.
          taskGhostNodeSlot.set(null);
          taskDragStore.reset();
          setGhostPointer({ active: false });
        };

        // Suppress the long-press context menu / image callout for the
        // duration of this pointer session. Listening in capture phase
        // means we beat the browser default.
        const handleContextMenu = (contextEvent: Event) => {
          contextEvent.preventDefault();
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

        const endDrag = (target: TaskDropTarget | null) => {
          finalizeDrop(target);
          cleanupPointerSession();
        };

        const handlePointerMove = (moveEvent: PointerEvent) => {
          if (moveEvent.pointerId !== event.pointerId) {
            return;
          }

          if (isTouch && !isDragging) {
            // Pre-activation movement on touch cancels the long-press
            // and lets the browser scroll naturally — preventing the
            // user from getting stuck in DnD when they meant to scroll.
            const deltaX = moveEvent.clientX - dragStartX;
            const deltaY = moveEvent.clientY - dragStartY;

            if (
              Math.hypot(deltaX, deltaY) > TOUCH_PRE_ACTIVATION_CANCEL_PIXELS
            ) {
              cleanupPointerSession();
            }

            return;
          }

          if (!isTouch && !isDragging) {
            const deltaX = moveEvent.clientX - dragStartX;
            const deltaY = moveEvent.clientY - dragStartY;

            if (Math.hypot(deltaX, deltaY) < MOUSE_ACTIVATION_PIXELS) {
              return;
            }

            startDragging();
          }

          // Once dragging, suppress browser handling (text selection,
          // touch scrolling, etc.).
          moveEvent.preventDefault();
          updateFromPointer(moveEvent.clientX, moveEvent.clientY);
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
          if (upEvent.pointerId !== event.pointerId) {
            return;
          }

          if (!isDragging) {
            // Tap/click without activation — just clean up.
            cleanupPointerSession();

            return;
          }

          const target = updateFromPointer(upEvent.clientX, upEvent.clientY);

          endDrag(target);
        };

        const handlePointerCancel = (cancelEvent: PointerEvent) => {
          if (cancelEvent.pointerId !== event.pointerId) {
            return;
          }

          cleanupPointerSession();
        };

        if (isTouch) {
          // Long-press timer activates the drag. If user moves before
          // it fires, handlePointerMove cancels everything.
          touchActivationTimerId = window.setTimeout(() => {
            touchActivationTimerId = null;
            startDragging();
          }, TOUCH_LONG_PRESS_MS);
        }

        window.addEventListener("pointermove", handlePointerMove, {
          passive: false,
        });
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerCancel);
        window.addEventListener("contextmenu", handleContextMenu, true);
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

type ColumnDropPlacement = {
  index: number;
  height: number;
  width: number;
};

const placementCache = new Map<string, ColumnDropPlacement | null>();

/**
 * Returns the placement of the drop placeholder inside this column, or
 * `null` when this column is not the active drop target. Cached per
 * column so the identity stays stable while the values do not change.
 */
export function useColumnDropPlacement(
  columnId: string,
): ColumnDropPlacement | null {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => {
      const snapshot = taskDragStore.getSnapshot();

      if (
        snapshot.previewColumnId !== columnId ||
        snapshot.previewIndex === null
      ) {
        placementCache.delete(columnId);

        return null;
      }

      const cached = placementCache.get(columnId);

      if (
        cached &&
        cached.index === snapshot.previewIndex &&
        cached.height === snapshot.draggingTaskHeight &&
        cached.width === snapshot.draggingTaskWidth
      ) {
        return cached;
      }

      const next: ColumnDropPlacement = {
        index: snapshot.previewIndex,
        height: snapshot.draggingTaskHeight,
        width: snapshot.draggingTaskWidth,
      };

      placementCache.set(columnId, next);

      return next;
    },
    () => null,
  );
}

type DragGhostSnapshot = {
  taskId: string;
  width: number;
  height: number;
} | null;

const ghostSnapshotCache: { value: DragGhostSnapshot } = { value: null };

/**
 * Snapshot consumed by the floating ghost component. Position is
 * intentionally excluded — the ghost reads pointer position
 * imperatively and never re-renders during pointer movement.
 */
export function useDragGhostSnapshot(): DragGhostSnapshot {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => {
      const snapshot = taskDragStore.getSnapshot();

      if (
        snapshot.draggingTaskId === null ||
        snapshot.draggingTaskHeight === 0
      ) {
        ghostSnapshotCache.value = null;

        return null;
      }

      const cached = ghostSnapshotCache.value;

      if (
        cached &&
        cached.taskId === snapshot.draggingTaskId &&
        cached.width === snapshot.draggingTaskWidth &&
        cached.height === snapshot.draggingTaskHeight
      ) {
        return cached;
      }

      const next: DragGhostSnapshot = {
        taskId: snapshot.draggingTaskId,
        width: snapshot.draggingTaskWidth,
        height: snapshot.draggingTaskHeight,
      };

      ghostSnapshotCache.value = next;

      return next;
    },
    () => null,
  );
}
