import { create } from "zustand";
import type { TaskFilter } from "@/features/TopBar/types";
import { readTaskQueryState } from "@/features/TopBar/urlQuery";
import { createUniquePrefixedId } from "@/utils/ids";
import { getVisibleTaskIds } from "@/utils/taskVisibility";
import { createInitialState } from "./initialState";
import {
  clearSelectionAfterTaskMutation,
  getColumnTasks,
  mergeTasksAtCompletionBoundary,
  moveItem,
  moveTaskToDestination,
  prependTasksInColumn,
  removeTaskAndSelection,
  reorderTasksForCompletionChange,
  replaceTasksInColumn,
  toggleIdInList,
  toggleTaskIdsSelection,
} from "./storeHelpers";
import type { StoreState } from "./types";

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
  toggleTaskSelection(taskId: string): void;
  toggleAllColumnTaskSelection(columnId: string): void;
  toggleAllVisibleTaskSelection(): void;
  toggleTaskCompletion(taskId: string): void;
  markSelectedTasksComplete(isComplete: boolean): void;
  deleteSelectedTasks(): void;
  moveSelectedTasks(columnId: string): void;
};

export type AppStore = StoreState & Actions;

/**
 * One-shot URL hydration. Read once at module load so initial render
 * already reflects `?search=...&filter=...`. `resetStore()` returns
 * to factory defaults (empty query) regardless of current URL.
 */
const URL_QUERY_SEED = readTaskQueryState();

export const useStore = create<AppStore>()((set) => ({
  ...createInitialState(),
  searchTerm: URL_QUERY_SEED.searchTerm,
  activeFilter: URL_QUERY_SEED.activeFilter,
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
  toggleTaskSelection(taskId) {
    set((state) => ({
      selectedTaskIds: toggleIdInList(state.selectedTaskIds, taskId),
    }));
  },
  toggleAllColumnTaskSelection(columnId) {
    set((state) => {
      const visibleTaskIds = getVisibleTaskIds(state.tasks, {
        columnId,
        activeFilter: state.activeFilter,
        searchTerm: state.searchTerm,
      });

      return {
        selectedTaskIds: toggleTaskIdsSelection(
          state.selectedTaskIds,
          visibleTaskIds,
        ),
      };
    });
  },
  toggleAllVisibleTaskSelection() {
    set((state) => ({
      selectedTaskIds: toggleTaskIdsSelection(
        state.selectedTaskIds,
        getVisibleTaskIds(state.tasks, {
          activeFilter: state.activeFilter,
          searchTerm: state.searchTerm,
        }),
      ),
    }));
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
