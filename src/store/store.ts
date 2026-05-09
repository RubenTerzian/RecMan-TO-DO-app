import { create } from "zustand";
import type { TaskFilter } from "@/features/TopBar/types";
import type { StoreState } from "./types";

type Actions = {
  resetStore(): void;
  setSearchTerm(searchTerm: string): void;
  setActiveFilter(activeFilter: TaskFilter): void;
  toggleSelectionMode(): void;
  clearSelectedTasks(): void;
  toggleTaskSelection(taskId: string): void;
  toggleColumnTaskSelection(taskIds: string[]): void;
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
        id: "column-todo",
        title: "To do",
      },
      {
        id: "column-done",
        title: "Done",
      },
    ],
    tasks: [
      {
        id: "task-1",
        columnId: "column-todo",
        title: "Plan board architecture",
        isComplete: false,
      },
      {
        id: "task-2",
        columnId: "column-todo",
        title: "Review rerender patterns",
        isComplete: false,
      },
      {
        id: "task-3",
        columnId: "column-done",
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
  toggleColumnTaskSelection(taskIds) {
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
