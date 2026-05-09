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
import { selectMoveTask } from "@/store/selectors";

type TaskDropEdge = "top" | "bottom";

type PointerTaskDropTarget =
  | {
      type: "task";
      columnId: string;
      edge: TaskDropEdge;
      taskId: string;
    }
  | {
      type: "empty-column";
      columnId: string;
    };

type TaskDropState = {
  draggingTaskId: string | null;
  previewColumnId: string | null;
  previewTaskId: string | null;
  previewEdge: TaskDropEdge | null;
  previewTitle: string | null;
};

type TaskPreviewSnapshot = {
  edge: TaskDropEdge | null;
  title: string;
};

export type TaskDragAndDropContextValue = {
  registerEmptyColumnDropTarget(
    columnId: string,
    element: HTMLElement | null,
  ): void;
  registerTaskDragHandle(taskId: string, element: HTMLElement | null): void;
  registerTaskElement(taskId: string, element: HTMLElement | null): void;
  registerTaskListElement(columnId: string, element: HTMLElement | null): void;
};

type UseTaskDragAndDropOptions = {
  boardViewportRef: RefObject<HTMLDivElement | null>;
  selectionMode: boolean;
};

type Listener = () => void;

type LastTaskDropTarget = {
  edge: TaskDropEdge;
  taskId: string;
};

const DEFAULT_DROP_STATE: TaskDropState = {
  draggingTaskId: null,
  previewColumnId: null,
  previewTaskId: null,
  previewEdge: null,
  previewTitle: null,
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

function createTaskDragStateStore() {
  let state = DEFAULT_DROP_STATE;
  const listeners = new Set<Listener>();

  return {
    getSnapshot() {
      return state;
    },
    reset() {
      state = DEFAULT_DROP_STATE;
      listeners.forEach((listener) => listener());
    },
    setState(nextState: TaskDropState) {
      if (
        state.draggingTaskId === nextState.draggingTaskId &&
        state.previewColumnId === nextState.previewColumnId &&
        state.previewTaskId === nextState.previewTaskId &&
        state.previewEdge === nextState.previewEdge &&
        state.previewTitle === nextState.previewTitle
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

const taskDragStateStore = createTaskDragStateStore();
const taskPreviewSnapshotCache = new Map<string, TaskPreviewSnapshot>();

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

export function useTaskDragAndDrop({
  boardViewportRef,
  selectionMode,
}: UseTaskDragAndDropOptions): TaskDragAndDropContextValue {
  const moveTask = useStore(selectMoveTask);
  const tasksRef = useRef(useStore.getState().tasks);
  const moveTaskRef = useRef(moveTask);
  const selectionModeRef = useRef(selectionMode);
  const dragTaskMidpointsRef = useRef(new Map<string, number>());
  const lastTaskDropTargetRef = useRef<LastTaskDropTarget | null>(null);
  const taskElementsRef = useRef(new Map<string, HTMLElement>());
  const taskDragHandleElementsRef = useRef(new Map<string, HTMLElement>());
  const taskListElementsRef = useRef(new Map<string, HTMLElement>());
  const emptyColumnDropTargetsRef = useRef(new Map<string, HTMLElement>());
  const taskHandleCleanupRef = useRef(new Map<string, () => void>());

  useEffect(() => {
    moveTaskRef.current = moveTask;
  }, [moveTask]);

  useEffect(() => {
    selectionModeRef.current = selectionMode;

    if (selectionMode) {
      dragTaskMidpointsRef.current.clear();
      lastTaskDropTargetRef.current = null;
      taskDragStateStore.reset();
      setDraggingDocumentState(false);
    }
  }, [selectionMode]);

  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      tasksRef.current = state.tasks;
    });

    return unsubscribe;
  }, []);

  const clearPreview = useCallback(() => {
    const currentState = taskDragStateStore.getSnapshot();

    if (
      currentState.previewColumnId === null &&
      currentState.previewTaskId === null &&
      currentState.previewEdge === null
    ) {
      return;
    }

    taskDragStateStore.setState({
      ...currentState,
      previewColumnId: null,
      previewTaskId: null,
      previewEdge: null,
    });
  }, []);

  const updateTaskPreview = useCallback(
    (
      previewColumnId: string,
      previewTaskId: string | null,
      previewEdge: TaskDropEdge | null,
    ) => {
      const currentState = taskDragStateStore.getSnapshot();

      taskDragStateStore.setState({
        ...currentState,
        previewColumnId,
        previewTaskId,
        previewEdge,
      });
    },
    [],
  );

  const updateTaskDropStateFromTarget = useCallback(
    (target: PointerTaskDropTarget | null) => {
      if (!target) {
        clearPreview();

        return;
      }

      if (target.type === "empty-column") {
        updateTaskPreview(target.columnId, null, null);

        return;
      }

      updateTaskPreview(target.columnId, target.taskId, target.edge);
    },
    [clearPreview, updateTaskPreview],
  );

  const getPointerDropTarget = useCallback(
    (
      clientX: number,
      clientY: number,
      draggingTaskId: string,
    ): PointerTaskDropTarget | null => {
      const midpointDeadZone = 10;

      for (const task of tasksRef.current) {
        if (task.id === draggingTaskId) {
          continue;
        }

        const element = taskElementsRef.current.get(task.id);

        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const midpointY =
          dragTaskMidpointsRef.current.get(task.id) ??
          rect.top + rect.height / 2;

        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          continue;
        }

        let edge: TaskDropEdge;

        if (clientY <= midpointY - midpointDeadZone) {
          edge = "top";
        } else if (clientY >= midpointY + midpointDeadZone) {
          edge = "bottom";
        } else if (lastTaskDropTargetRef.current?.taskId === task.id) {
          edge = lastTaskDropTargetRef.current.edge;
        } else {
          edge = clientY < midpointY ? "top" : "bottom";
        }

        lastTaskDropTargetRef.current = {
          edge,
          taskId: task.id,
        };

        return {
          type: "task",
          columnId: task.columnId,
          edge,
          taskId: task.id,
        };
      }

      for (const [
        columnId,
        element,
      ] of emptyColumnDropTargetsRef.current.entries()) {
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
          type: "empty-column",
          columnId,
        };
      }

      lastTaskDropTargetRef.current = null;

      return null;
    },
    [],
  );

  const autoScrollForPointerPoint = useCallback(
    (clientX: number, clientY: number) => {
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

      for (const element of taskListElementsRef.current.values()) {
        const rect = element.getBoundingClientRect();

        if (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        ) {
          continue;
        }

        const verticalThreshold = 48;
        const verticalScrollStep = 16;

        if (clientY <= rect.top + verticalThreshold) {
          element.scrollBy({ top: -verticalScrollStep });
        } else if (clientY >= rect.bottom - verticalThreshold) {
          element.scrollBy({ top: verticalScrollStep });
        }

        break;
      }
    },
    [boardViewportRef],
  );

  const registerTaskElement = useCallback(
    (taskId: string, element: HTMLElement | null) => {
      if (!element) {
        taskElementsRef.current.delete(taskId);
        taskPreviewSnapshotCache.delete(taskId);

        return;
      }

      taskElementsRef.current.set(taskId, element);
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
        let isDragging = false;

        const ensureDraggingStarted = () => {
          if (isDragging) {
            return;
          }

          isDragging = true;
          dragTaskMidpointsRef.current.clear();

          for (const task of tasksRef.current) {
            if (task.id === currentTask.id) {
              continue;
            }

            const taskElement = taskElementsRef.current.get(task.id);

            if (!taskElement) {
              continue;
            }

            const rect = taskElement.getBoundingClientRect();

            dragTaskMidpointsRef.current.set(
              task.id,
              rect.top + rect.height / 2,
            );
          }

          lastTaskDropTargetRef.current = null;
          setDraggingDocumentState(true);
          taskDragStateStore.setState({
            draggingTaskId: currentTask.id,
            previewColumnId: null,
            previewTaskId: null,
            previewEdge: null,
            previewTitle: currentTask.title,
          });
        };

        const updateFromPointer = (clientX: number, clientY: number) => {
          ensureDraggingStarted();
          autoScrollForPointerPoint(clientX, clientY);

          const target = getPointerDropTarget(clientX, clientY, currentTask.id);

          updateTaskDropStateFromTarget(target);

          return target;
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

          if (target?.type === "task") {
            moveTaskRef.current(currentTask.id, {
              columnId: target.columnId,
              position: target.edge === "bottom" ? "after" : "before",
              targetTaskId: target.taskId,
            });
          } else if (target?.type === "empty-column") {
            moveTaskRef.current(currentTask.id, { columnId: target.columnId });
          }

          cleanupPointerSession();
          dragTaskMidpointsRef.current.clear();
          lastTaskDropTargetRef.current = null;
          taskDragStateStore.reset();
        };

        const handlePointerCancel = (cancelEvent: PointerEvent) => {
          if (cancelEvent.pointerId !== event.pointerId) {
            return;
          }

          cleanupPointerSession();

          if (isDragging) {
            dragTaskMidpointsRef.current.clear();
            lastTaskDropTargetRef.current = null;
            taskDragStateStore.reset();
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
    [
      autoScrollForPointerPoint,
      getPointerDropTarget,
      updateTaskDropStateFromTarget,
    ],
  );

  const registerTaskListElement = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        taskListElementsRef.current.delete(columnId);

        return;
      }

      taskListElementsRef.current.set(columnId, element);
    },
    [],
  );

  const registerEmptyColumnDropTarget = useCallback(
    (columnId: string, element: HTMLElement | null) => {
      if (!element) {
        emptyColumnDropTargetsRef.current.delete(columnId);

        return;
      }

      emptyColumnDropTargetsRef.current.set(columnId, element);
    },
    [],
  );

  useEffect(() => {
    const taskHandleCleanupMap = taskHandleCleanupRef.current;
    const dragTaskMidpoints = dragTaskMidpointsRef.current;

    return () => {
      taskHandleCleanupMap.forEach((cleanup) => cleanup());
      taskHandleCleanupMap.clear();
      dragTaskMidpoints.clear();
      lastTaskDropTargetRef.current = null;
      setDraggingDocumentState(false);
    };
  }, []);

  return useMemo(
    () => ({
      registerEmptyColumnDropTarget,
      registerTaskDragHandle,
      registerTaskElement,
      registerTaskListElement,
    }),
    [
      registerEmptyColumnDropTarget,
      registerTaskDragHandle,
      registerTaskElement,
      registerTaskListElement,
    ],
  );
}

export function useTaskPreview(taskId: string) {
  return useSyncExternalStore(
    taskDragStateStore.subscribe,
    () => {
      const dragState = taskDragStateStore.getSnapshot();

      if (dragState.previewTaskId !== taskId) {
        taskPreviewSnapshotCache.delete(taskId);

        return null;
      }

      const nextTitle = dragState.previewTitle ?? "Moving task";
      const cachedSnapshot = taskPreviewSnapshotCache.get(taskId);

      if (
        cachedSnapshot &&
        cachedSnapshot.edge === dragState.previewEdge &&
        cachedSnapshot.title === nextTitle
      ) {
        return cachedSnapshot;
      }

      const nextSnapshot = {
        edge: dragState.previewEdge,
        title: nextTitle,
      };

      taskPreviewSnapshotCache.set(taskId, nextSnapshot);

      return nextSnapshot;
    },
    () => null,
  );
}

export function useIsTaskDragging(taskId: string) {
  return useSyncExternalStore(
    taskDragStateStore.subscribe,
    () => taskDragStateStore.getSnapshot().draggingTaskId === taskId,
    () => false,
  );
}

export function useEmptyColumnPreview(columnId: string) {
  return useSyncExternalStore(
    taskDragStateStore.subscribe,
    () => {
      const dragState = taskDragStateStore.getSnapshot();

      if (
        dragState.previewColumnId !== columnId ||
        dragState.previewTaskId !== null
      ) {
        return null;
      }

      return dragState.previewTitle ?? "Moving task";
    },
    () => null,
  );
}
