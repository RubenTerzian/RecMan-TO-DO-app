import type { AppStore } from "./store";
import { getTaskSelectionState } from "./storeHelpers";
import { getVisibleTaskIds } from "@/utils/taskVisibility";

export const selectSelectionMode = (state: AppStore) => state.selectionMode;

export const selectColumnIds = (state: AppStore) =>
  state.columns.map((column) => column.id);

export const selectHasColumns = (state: AppStore) => state.columns.length > 0;

export const selectSearchTerm = (state: AppStore) => state.searchTerm;

export const selectActiveFilter = (state: AppStore) => state.activeFilter;

export const selectCreateColumn = (state: AppStore) => state.createColumn;

export const selectUpdateColumnTitle = (state: AppStore) =>
  state.updateColumnTitle;

export const selectDeleteColumn = (state: AppStore) => state.deleteColumn;

export const selectCreateTask = (state: AppStore) => state.createTask;

export const selectUpdateTaskTitle = (state: AppStore) => state.updateTaskTitle;

export const selectDeleteTask = (state: AppStore) => state.deleteTask;

export const selectSetActiveFilter = (state: AppStore) => state.setActiveFilter;

export const selectResetTaskFilters = (state: AppStore) =>
  state.resetTaskFilters;

export const selectHasActiveTaskFilters = (state: AppStore) =>
  state.activeFilter !== "all" || state.searchTerm.trim().length > 0;

const selectVisibleTaskIds = (state: AppStore) =>
  getVisibleTaskIds(state.tasks, {
    activeFilter: state.activeFilter,
    searchTerm: state.searchTerm,
  });

export const selectHasVisibleTasks = (state: AppStore) =>
  selectVisibleTaskIds(state).length > 0;

export const selectVisibleTaskSelectionState = (state: AppStore) =>
  getTaskSelectionState(state.selectedTaskIds, selectVisibleTaskIds(state));

export const selectToggleSelectionMode = (state: AppStore) =>
  state.toggleSelectionMode;

export const selectToggleTaskCompletion = (state: AppStore) =>
  state.toggleTaskCompletion;

export const selectToggleTaskSelection = (state: AppStore) =>
  state.toggleTaskSelection;

export function selectTaskById(taskId: string) {
  return (state: AppStore) =>
    state.tasks.find((currentTask) => currentTask.id === taskId);
}

export function selectColumnTitle(columnId: string) {
  return (state: AppStore) =>
    state.columns.find((column) => column.id === columnId)?.title ?? "";
}

export function selectIsTaskSelected(taskId: string) {
  return (state: AppStore) => state.selectedTaskIds.includes(taskId);
}

export function selectVisibleTaskIdsByColumn(columnId: string) {
  return (state: AppStore) =>
    getVisibleTaskIds(state.tasks, {
      columnId,
      activeFilter: state.activeFilter,
      searchTerm: state.searchTerm,
    });
}

export function selectHasVisibleTasksByColumn(columnId: string) {
  return (state: AppStore) =>
    selectVisibleTaskIdsByColumn(columnId)(state).length > 0;
}

export function selectVisibleColumnTaskSelectionState(columnId: string) {
  return (state: AppStore) =>
    getTaskSelectionState(
      state.selectedTaskIds,
      selectVisibleTaskIdsByColumn(columnId)(state),
    );
}

export function selectColumnTaskCount(columnId: string) {
  return (state: AppStore) =>
    state.tasks.reduce(
      (count, task) => (task.columnId === columnId ? count + 1 : count),
      0,
    );
}
