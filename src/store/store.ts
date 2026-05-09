import { create } from "zustand";
import type { TaskFilter } from "@/features/TopBar/types";
import type { StoreState } from "./types";
import { createUniquePrefixedId } from "@/utils/ids";

type Actions = {
  resetStore(): void;
  createColumn(title: string): void;
  updateColumnTitle(columnId: string, title: string): void;
  deleteColumn(columnId: string): void;
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
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, isComplete: !task.isComplete } : task,
      ),
    }));
  },
  markSelectedTasksComplete(isComplete) {
    set((state) =>
      clearSelectionAfterTaskMutation(
        state,
        state.tasks.map((task) =>
          state.selectedTaskIds.includes(task.id)
            ? { ...task, isComplete }
            : task,
        ),
      ),
    );
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
    set((state) =>
      clearSelectionAfterTaskMutation(
        state,
        state.tasks.map((task) =>
          state.selectedTaskIds.includes(task.id)
            ? { ...task, columnId }
            : task,
        ),
      ),
    );
  },
}));
