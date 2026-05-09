import type { AppStore } from "./store";

export const selectColumns = (state: AppStore) => state.columns;

export const selectSelectionMode = (state: AppStore) => state.selectionMode;

export const selectBoardGridState = (state: AppStore) => ({
  columns: state.columns,
  selectionMode: state.selectionMode,
});

export const selectSearchTerm = (state: AppStore) => state.searchTerm;

export const selectActiveFilter = (state: AppStore) => state.activeFilter;

export const selectCreateColumn = (state: AppStore) => state.createColumn;

export const selectSetSearchTerm = (state: AppStore) => state.setSearchTerm;

export const selectSetActiveFilter = (state: AppStore) => state.setActiveFilter;

export const selectSelectedTaskIds = (state: AppStore) => state.selectedTaskIds;

export const selectSelectedTaskCount = (state: AppStore) =>
  state.selectedTaskIds.length;

export const selectToggleSelectionMode = (state: AppStore) =>
  state.toggleSelectionMode;

export const selectMarkSelectedTasksComplete = (state: AppStore) =>
  state.markSelectedTasksComplete;

export const selectDeleteSelectedTasks = (state: AppStore) =>
  state.deleteSelectedTasks;

export const selectMoveSelectedTasks = (state: AppStore) =>
  state.moveSelectedTasks;

export const selectToggleTaskCompletion = (state: AppStore) =>
  state.toggleTaskCompletion;

export const selectToggleTaskSelection = (state: AppStore) =>
  state.toggleTaskSelection;

export const selectToggleAllTaskSelection = (state: AppStore) =>
  state.toggleAllTaskSelection;

export function makeSelectTaskById(taskId: string) {
  return (state: AppStore) =>
    state.tasks.find((currentTask) => currentTask.id === taskId);
}

export function makeSelectIsTaskSelected(taskId: string) {
  return (state: AppStore) => state.selectedTaskIds.includes(taskId);
}

export function makeSelectTasksByColumnId(columnId: string) {
  return (state: AppStore) =>
    state.tasks.filter((task) => task.columnId === columnId);
}

export function makeSelectSelectedCountForTaskIds(taskIds: string[]) {
  return (state: AppStore) => {
    if (taskIds.length === 0) {
      return 0;
    }

    return taskIds.reduce(
      (count, taskId) =>
        count + (state.selectedTaskIds.includes(taskId) ? 1 : 0),
      0,
    );
  };
}
