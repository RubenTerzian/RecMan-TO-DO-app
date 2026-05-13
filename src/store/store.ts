import { create } from "zustand";
import type { TaskFilter } from "@/features/TopBar/types";
import { readTaskQueryState } from "@/features/TopBar/urlQuery";
import type { StoreState } from "./types";
import { createUniquePrefixedId } from "@/utils/ids";
import { loadStoredState } from "./persistence";

type Actions = {
  resetStore(): void;
  createColumn(title: string): void;
  updateColumnTitle(columnId: string, title: string): void;
  deleteColumn(columnId: string): void;
  moveColumn(columnId: string, targetIndex: number): void;
  moveTask(
    taskId: string,
    destination: {
      columnId: string;
      targetTaskId?: string;
      position?: "before" | "after";
    },
  ): void;
  createTask(columnId: string, title: string): void;
  updateTaskTitle(taskId: string, title: string): void;
  deleteTask(taskId: string): void;
  setSearchTerm(searchTerm: string): void;
  setActiveFilter(activeFilter: TaskFilter): void;
  resetTaskFilters(): void;
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

function moveItem<TItem>(
  items: TItem[],
  startIndex: number,
  finishIndex: number,
) {
  if (
    startIndex < 0 ||
    finishIndex < 0 ||
    startIndex >= items.length ||
    finishIndex >= items.length ||
    startIndex === finishIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(startIndex, 1);

  nextItems.splice(finishIndex, 0, movedItem);

  return nextItems;
}

function createInitialState(): StoreState {
  const persistedState = loadStoredState();
  const queryState = readTaskQueryState();

  return {
    columns: persistedState?.columns ?? [
      {
        id: "column-1",
        title: "New Applications",
      },
      {
        id: "column-2",
        title: "Phone Screen",
      },
      {
        id: "column-3",
        title: "Onsite Interviews",
      },
    ],
    tasks: persistedState?.tasks ?? [
      {
        id: "task-1",
        columnId: "column-1",
        title: "Maya Patel - Senior Recruiter",
        isComplete: false,
      },
      {
        id: "task-2",
        columnId: "column-2",
        title: "Jordan Lee - Customer Success Manager",
        isComplete: false,
      },
      {
        id: "task-3",
        columnId: "column-3",
        title: "Alex Chen - Product Designer",
        isComplete: true,
      },
    ],
    selectedTaskIds: [],
    selectionMode: false,
    activeFilter: queryState.activeFilter,
    searchTerm: queryState.searchTerm,
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

function getColumnBoundaryInsertionIndex(
  tasks: StoreState["tasks"],
  columns: StoreState["columns"],
  columnId: string,
) {
  const lastTaskIndex = tasks.reduce((result, task, index) => {
    if (task.columnId !== columnId) {
      return result;
    }

    return index;
  }, -1);

  if (lastTaskIndex >= 0) {
    return lastTaskIndex + 1;
  }

  const columnIndex = columns.findIndex((column) => column.id === columnId);

  if (columnIndex < 0) {
    return tasks.length;
  }

  for (
    let nextColumnIndex = columnIndex + 1;
    nextColumnIndex < columns.length;
    nextColumnIndex += 1
  ) {
    const nextColumnId = columns[nextColumnIndex]?.id;

    if (!nextColumnId) {
      continue;
    }

    const nextTaskIndex = tasks.findIndex(
      (task) => task.columnId === nextColumnId,
    );

    if (nextTaskIndex >= 0) {
      return nextTaskIndex;
    }
  }

  return tasks.length;
}

function moveTaskToDestination(
  tasks: StoreState["tasks"],
  columns: StoreState["columns"],
  taskId: string,
  destination: {
    columnId: string;
    targetTaskId?: string;
    position?: "before" | "after";
  },
) {
  const movingTask = tasks.find((task) => task.id === taskId);

  if (!movingTask) {
    return tasks;
  }

  const remainingTasks = tasks.filter((task) => task.id !== taskId);
  const movedTask = {
    ...movingTask,
    columnId: destination.columnId,
  };

  if (destination.targetTaskId) {
    const targetIndex = remainingTasks.findIndex(
      (task) => task.id === destination.targetTaskId,
    );

    if (targetIndex >= 0) {
      const insertionIndex =
        destination.position === "after" ? targetIndex + 1 : targetIndex;

      return [
        ...remainingTasks.slice(0, insertionIndex),
        movedTask,
        ...remainingTasks.slice(insertionIndex),
      ];
    }
  }

  const insertionIndex = getColumnBoundaryInsertionIndex(
    remainingTasks,
    columns,
    destination.columnId,
  );

  return [
    ...remainingTasks.slice(0, insertionIndex),
    movedTask,
    ...remainingTasks.slice(insertionIndex),
  ];
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

      const nextColumns = state.columns.filter(
        (column) => column.id !== columnId,
      );

      return {
        columns: nextColumns,
        tasks: state.tasks.filter((task) => task.columnId !== columnId),
        selectedTaskIds: state.selectedTaskIds.filter(
          (taskId) => !removedTaskIds.has(taskId),
        ),
        // Exit selection mode automatically when there are no columns left
        // — the toggle and bulk bar are not visible in that state.
        selectionMode: nextColumns.length === 0 ? false : state.selectionMode,
      };
    });
  },
  moveColumn(columnId, targetIndex) {
    set((state) => {
      const startIndex = state.columns.findIndex(
        (column) => column.id === columnId,
      );

      if (
        startIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= state.columns.length
      ) {
        return state;
      }

      return {
        columns: moveItem(state.columns, startIndex, targetIndex),
      };
    });
  },
  moveTask(taskId, destination) {
    set((state) => ({
      tasks: moveTaskToDestination(
        state.tasks,
        state.columns,
        taskId,
        destination,
      ),
    }));
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
  resetTaskFilters() {
    set({
      activeFilter: "all",
      searchTerm: "",
    });
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
