import type { AppStore } from "./store";

export const selectSelectionMode = (state: AppStore) => state.selectionMode;

export const selectSearchTerm = (state: AppStore) => state.searchTerm;

export const selectActiveFilter = (state: AppStore) => state.activeFilter;

export const selectCreateColumn = (state: AppStore) => state.createColumn;

export const selectUpdateColumnTitle = (state: AppStore) =>
  state.updateColumnTitle;

export const selectDeleteColumn = (state: AppStore) => state.deleteColumn;

export const selectCreateTask = (state: AppStore) => state.createTask;

export const selectUpdateTaskTitle = (state: AppStore) => state.updateTaskTitle;

export const selectDeleteTask = (state: AppStore) => state.deleteTask;

export const selectSetSearchTerm = (state: AppStore) => state.setSearchTerm;

export const selectSetActiveFilter = (state: AppStore) => state.setActiveFilter;

export const selectResetTaskFilters = (state: AppStore) =>
  state.resetTaskFilters;

export const selectHasActiveTaskFilters = (state: AppStore) =>
  state.activeFilter !== "all" || state.searchTerm.trim().length > 0;

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

export function makeSelectColumnTitle(columnId: string) {
  return (state: AppStore) =>
    state.columns.find((column) => column.id === columnId)?.title ?? "";
}

export function makeSelectIsTaskSelected(taskId: string) {
  return (state: AppStore) => state.selectedTaskIds.includes(taskId);
}

export function makeSelectTasksByColumnId(columnId: string) {
  return (state: AppStore) =>
    state.tasks.filter((task) => task.columnId === columnId);
}

export function makeSelectColumnTaskCount(columnId: string) {
  return (state: AppStore) =>
    state.tasks.reduce(
      (count, task) => (task.columnId === columnId ? count + 1 : count),
      0,
    );
}
