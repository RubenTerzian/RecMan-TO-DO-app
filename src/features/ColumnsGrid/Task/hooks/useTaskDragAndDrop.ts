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

type TaskDropTarget = {
  columnId: string;
  /** Index in this column's task list where the dragged task would land (0..tasks.length). */
  index: number;
};

type TaskDragSnapshot = {
  draggingTaskId: string | null;
  draggingTaskTitle: string;
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
  draggingTaskTitle: "",
  draggingTaskHeight: 0,
  draggingTaskWidth: 0,
  sourceColumnId: null,
  previewColumnId: null,
  previewIndex: null,
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
        state.draggingTaskTitle === nextState.draggingTaskTitle &&
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
 * Pointer position store for the drag ghost. Updated imperatively at
 * raf-throttle frequency. Decoupled from the main drag snapshot so that
 * pointer movement does not invalidate the heavier snapshot.
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

function setDraggingDocumentState(isDragging: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.cursor = isDragging ? "grabbing" : "";
  document.body.style.userSelect = isDragging ? "none" : "";
}

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
          setGhostPointer({ active: false });
          setDraggingDocumentState(false);
        }
      }
    });
  }, []);

  /**
   * Find which column the pointer is over (using the registered drop-zone
   * element, which is the task list container). Pointer outside any
   * column => null target.
   */
  const getColumnAtPoint = useCallback(
    (clientX: number, clientY: number): ColumnRect | null => {
      for (const [columnId, element] of columnDropZonesRef.current.entries()) {
        const rect = element.getBoundingClientRect();

        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return { columnId, rect };
        }
      }

      return null;
    },
    [],
  );

  /**
   * Compute the drop index inside a column based on cursor Y.
   *
   * Excludes the dragged task from the candidate list (we treat the
   * dragged card as if it has been removed from the column already).
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

        if (shouldIgnoreDragStart(event.target, element)) {
          return;
        }

        const currentTask = tasksRef.current.find((task) => task.id === taskId);

        if (!currentTask) {
          return;
        }

        event.preventDefault();

        if (element.hasPointerCapture?.(event.pointerId) === false) {
          element.setPointerCapture?.(event.pointerId);
        }

        const activationThreshold = 6;
        const dragStartX = event.clientX;
        const dragStartY = event.clientY;
        const taskElement =
          taskElementsRef.current.get(currentTask.id) ?? element;
        const cardRect = taskElement.getBoundingClientRect();
        const grabOffsetX = dragStartX - cardRect.left;
        const grabOffsetY = dragStartY - cardRect.top;
        let isDragging = false;

        const startDragging = () => {
          if (isDragging) {
            return;
          }

          isDragging = true;
          setDraggingDocumentState(true);

          taskDragStore.setState({
            draggingTaskId: currentTask.id,
            draggingTaskTitle: currentTask.title,
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
          startDragging();

          // Always move the ghost first so it follows the cursor smoothly.
          setGhostPointer({ x: clientX, y: clientY });

          const columnAtPoint = getColumnAtPoint(clientX, clientY);

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

        const cleanupPointerSession = () => {
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
            cleanupPointerSession();

            return;
          }

          const target = updateFromPointer(upEvent.clientX, upEvent.clientY);

          finalizeDrop(target);

          cleanupPointerSession();
          taskDragStore.reset();
          setGhostPointer({ active: false });
        };

        const handlePointerCancel = (cancelEvent: PointerEvent) => {
          if (cancelEvent.pointerId !== event.pointerId) {
            return;
          }

          cleanupPointerSession();

          if (isDragging) {
            taskDragStore.reset();
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

/**
 * Returns true when `taskId` is the currently dragging task. Used to hide
 * the source card from its column while it is being dragged.
 */
export function useIsTaskDragging(taskId: string) {
  return useSyncExternalStore(
    taskDragStore.subscribe,
    () => taskDragStore.getSnapshot().draggingTaskId === taskId,
    () => false,
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
 * Returns true when this column is the active drop target column. Used to
 * highlight the column visually.
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
 * null when this column is not the active drop target. Cached per column
 * so identity stays stable while the values do not change.
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

/**
 * Drag ghost snapshot for the floating card that follows the cursor.
 * Position is excluded — the ghost component reads pointer position
 * imperatively and updates its own DOM transform.
 */
type DragGhostSnapshot = {
  taskId: string;
  title: string;
  width: number;
  height: number;
} | null;

const ghostSnapshotCache: { value: DragGhostSnapshot } = { value: null };

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
        cached.title === snapshot.draggingTaskTitle &&
        cached.width === snapshot.draggingTaskWidth &&
        cached.height === snapshot.draggingTaskHeight
      ) {
        return cached;
      }

      const next: DragGhostSnapshot = {
        taskId: snapshot.draggingTaskId,
        title: snapshot.draggingTaskTitle,
        width: snapshot.draggingTaskWidth,
        height: snapshot.draggingTaskHeight,
      };

      ghostSnapshotCache.value = next;

      return next;
    },
    () => null,
  );
}
