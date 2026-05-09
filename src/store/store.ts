import { create } from "zustand";
import type { TaskFilter } from "@/features/TopBar/types";
import type { StoreState } from "./types";
import { createUniquePrefixedId } from "@/utils/ids";

type Actions = {
  resetStore(): void;
  createColumn(title: string): void;
  updateColumnTitle(columnId: string, title: string): void;
  deleteColumn(columnId: string): void;
  createTask(columnId: string, title: string): void;
  updateTaskTitle(taskId: string, title: string): void;
  deleteTask(taskId: string): void;
  setSearchTerm(searchTerm: string): void;
  setActiveFilter(activeFilter: TaskFilter): void;
  toggleSelectionMode(): void;
  clearSelectedTasks(): void;
  toggleTaskSelection(taskId: string): void;
  toggleAllTaskSelection(taskIds: string[]): void;
  toggleTaskCompletion(taskId: string): void;
  markSelectedTasksComplete(isComplete: boolean): void;
  deleteSelectedTasks(): void;
  moveSelectedTasks(columnId: string): void;
};

export type AppStore = StoreState & Actions;

function createInitialState(): StoreState {
  return {
    columns: [
      {
        id: "column-1",
        title: "Column 1",
      },
      {
        id: "column-2",
        title: "Column 2",
      },
    ],
    tasks: [
      {
        id: "task-1",
        columnId: "column-1",
        title: "Plan board architecture",
        isComplete: false,
      },
      {
        id: "task-2",
        columnId: "column-1",
        title: "Review rerender patterns",
        isComplete: false,
      },
      {
        id: "task-3",
        columnId: "column-2",
        title: "Normalize board state",
        isComplete: true,
      },
    ],
    selectedTaskIds: [],
    selectionMode: false,
    activeFilter: "all",
    searchTerm: "",
  };
}

function toggleIdInList(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function clearSelectionAfterTaskMutation(
  state: AppStore,
  tasks: StoreState["tasks"],
) {
  return {
    ...state,
    tasks,
    selectedTaskIds: [],
  };
}

function getColumnTasks(tasks: StoreState["tasks"], columnId: string) {
  return tasks.filter((task) => task.columnId === columnId);
}

function replaceTasksInColumn(
  tasks: StoreState["tasks"],
  columnId: string,
  nextColumnTasks: StoreState["tasks"],
) {
  let nextColumnTaskIndex = 0;

  const nextTasks = tasks.flatMap((task) => {
    if (task.columnId !== columnId) {
      return [task];
    }

    if (nextColumnTaskIndex >= nextColumnTasks.length) {
      return [];
    }

    const nextTask = nextColumnTasks[nextColumnTaskIndex];
    nextColumnTaskIndex += 1;

    return [nextTask];
  });

  if (nextColumnTaskIndex >= nextColumnTasks.length) {
    return nextTasks;
  }

  return [...nextTasks, ...nextColumnTasks.slice(nextColumnTaskIndex)];
}

function mergeTasksAtCompletionBoundary(
  existingColumnTasks: StoreState["tasks"],
  incomingTasks: StoreState["tasks"],
) {
  const remainingIncompleteTasks = existingColumnTasks.filter(
    (task) => !task.isComplete,
  );
  const remainingCompleteTasks = existingColumnTasks.filter(
    (task) => task.isComplete,
  );
  const incomingIncompleteTasks = incomingTasks.filter(
    (task) => !task.isComplete,
  );
  const incomingCompleteTasks = incomingTasks.filter((task) => task.isComplete);

  return [
    ...remainingIncompleteTasks,
    ...incomingIncompleteTasks,
    ...incomingCompleteTasks,
    ...remainingCompleteTasks,
  ];
}

function prependTasksInColumn(
  existingColumnTasks: StoreState["tasks"],
  incomingTasks: StoreState["tasks"],
) {
  return [...incomingTasks, ...existingColumnTasks];
}

function reorderTasksForCompletionChange(
  columnTasks: StoreState["tasks"],
  taskIds: string[],
  isComplete: boolean,
) {
  const taskIdSet = new Set(taskIds);
  const movingTasks = columnTasks
    .filter((task) => taskIdSet.has(task.id))
    .map((task) => ({ ...task, isComplete }));
  const remainingTasks = columnTasks.filter((task) => !taskIdSet.has(task.id));

  return mergeTasksAtCompletionBoundary(remainingTasks, movingTasks);
}

function removeTaskAndSelection(state: AppStore, taskId: string) {
  return {
    tasks: state.tasks.filter((task) => task.id !== taskId),
    selectedTaskIds: state.selectedTaskIds.filter(
      (selectedTaskId) => selectedTaskId !== taskId,
    ),
  };
}

export const useStore = create<AppStore>()((set) => ({
  ...createInitialState(),
  resetStore() {
    set(createInitialState());
  },
  createColumn(title) {
    set((state) => ({
      columns: [
        ...state.columns,
        {
          id: createUniquePrefixedId("column"),
          title,
        },
      ],
    }));
  },
  updateColumnTitle(columnId, title) {
    set((state) => ({
      columns: state.columns.map((column) =>
        column.id === columnId ? { ...column, title } : column,
      ),
    }));
  },
  deleteColumn(columnId) {
    set((state) => {
      const removedTaskIds = new Set(
        state.tasks
          .filter((task) => task.columnId === columnId)
          .map((task) => task.id),
      );

      return {
        columns: state.columns.filter((column) => column.id !== columnId),
        tasks: state.tasks.filter((task) => task.columnId !== columnId),
        selectedTaskIds: state.selectedTaskIds.filter(
          (taskId) => !removedTaskIds.has(taskId),
        ),
      };
    });
  },
  createTask(columnId, title) {
    set((state) => {
      const nextTask = {
        id: createUniquePrefixedId("task"),
        columnId,
        title,
        isComplete: false,
      };
      const nextColumnTasks = prependTasksInColumn(
        getColumnTasks(state.tasks, columnId),
        [nextTask],
      );

      return {
        tasks: replaceTasksInColumn(state.tasks, columnId, nextColumnTasks),
      };
    });
  },
  updateTaskTitle(taskId, title) {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, title } : task,
      ),
    }));
  },
  deleteTask(taskId) {
    set((state) => removeTaskAndSelection(state, taskId));
  },
  setSearchTerm(searchTerm) {
    set({ searchTerm });
  },
  setActiveFilter(activeFilter) {
    set({ activeFilter });
  },
  toggleSelectionMode() {
    set((state) => ({
      selectionMode: !state.selectionMode,
      selectedTaskIds: state.selectionMode ? [] : state.selectedTaskIds,
    }));
  },
  clearSelectedTasks() {
    set({ selectedTaskIds: [] });
  },
  toggleTaskSelection(taskId) {
    set((state) => ({
      selectedTaskIds: toggleIdInList(state.selectedTaskIds, taskId),
    }));
  },
  toggleAllTaskSelection(taskIds) {
    set((state) => {
      const allSelected =
        taskIds.length > 0 &&
        taskIds.every((taskId) => state.selectedTaskIds.includes(taskId));

      return {
        selectedTaskIds: allSelected
          ? state.selectedTaskIds.filter((taskId) => !taskIds.includes(taskId))
          : Array.from(new Set([...state.selectedTaskIds, ...taskIds])),
      };
    });
  },
  toggleTaskCompletion(taskId) {
    set((state) => {
      const currentTask = state.tasks.find((task) => task.id === taskId);

      if (!currentTask) {
        return state;
      }

      const nextColumnTasks = reorderTasksForCompletionChange(
        getColumnTasks(state.tasks, currentTask.columnId),
        [taskId],
        !currentTask.isComplete,
      );

      return {
        tasks: replaceTasksInColumn(
          state.tasks,
          currentTask.columnId,
          nextColumnTasks,
        ),
      };
    });
  },
  markSelectedTasksComplete(isComplete) {
    set((state) => {
      let nextTasks = state.tasks;
      const selectedTasksByColumn = new Map<string, string[]>();

      state.tasks.forEach((task) => {
        if (!state.selectedTaskIds.includes(task.id)) {
          return;
        }

        const columnTaskIds = selectedTasksByColumn.get(task.columnId) ?? [];
        columnTaskIds.push(task.id);
        selectedTasksByColumn.set(task.columnId, columnTaskIds);
      });

      selectedTasksByColumn.forEach((taskIds, columnId) => {
        nextTasks = replaceTasksInColumn(
          nextTasks,
          columnId,
          reorderTasksForCompletionChange(
            getColumnTasks(nextTasks, columnId),
            taskIds,
            isComplete,
          ),
        );
      });

      return clearSelectionAfterTaskMutation(state, nextTasks);
    });
  },
  deleteSelectedTasks() {
    set((state) =>
      clearSelectionAfterTaskMutation(
        state,
        state.tasks.filter((task) => !state.selectedTaskIds.includes(task.id)),
      ),
    );
  },
  moveSelectedTasks(columnId) {
    set((state) => {
      const movingTaskIdSet = new Set(state.selectedTaskIds);
      const movingTasks = state.tasks
        .filter((task) => movingTaskIdSet.has(task.id))
        .map((task) => ({ ...task, columnId }));
      const remainingTasks = state.tasks.filter(
        (task) => !movingTaskIdSet.has(task.id),
      );
      const nextTargetColumnTasks = mergeTasksAtCompletionBoundary(
        getColumnTasks(remainingTasks, columnId),
        movingTasks,
      );

      return clearSelectionAfterTaskMutation(
        state,
        replaceTasksInColumn(remainingTasks, columnId, nextTargetColumnTasks),
      );
    });
  },
}));
