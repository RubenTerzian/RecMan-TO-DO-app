import { useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import type { ColumnEmptyState } from "@/features/ColumnsGrid/Column/types";
import { useShallow } from "zustand/react/shallow";
import {
  makeSelectTasksByColumnId,
  selectActiveFilter,
  selectSearchTerm,
  selectSelectedTaskIds,
  selectToggleAllTaskSelection,
} from "@/store/selectors";

type UseColumnOptions = {
  columnId: string;
};

const DEFAULT_EMPTY_STATE: ColumnEmptyState = {
  variant: "empty",
  title: "No tasks yet",
  message: "Add your first task to start filling this column.",
};

const NO_RESULTS_EMPTY_STATE: ColumnEmptyState = {
  variant: "no-results",
  title: "No matching tasks",
  message: "Try a different search or filter to see tasks here.",
};

function matchesSearchTerm(title: string, searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return title.toLowerCase().includes(normalizedSearchTerm);
}

function matchesActiveFilter(
  isComplete: boolean,
  activeFilter: ReturnType<typeof useStore.getState>["activeFilter"],
) {
  if (activeFilter === "complete") {
    return isComplete;
  }

  if (activeFilter === "incomplete") {
    return !isComplete;
  }

  return true;
}

function getEmptyState(
  totalTaskCount: number,
  visibleTaskCount: number,
  hasActiveTaskFilters: boolean,
) {
  if (totalTaskCount > 0 && visibleTaskCount === 0 && hasActiveTaskFilters) {
    return NO_RESULTS_EMPTY_STATE;
  }

  return DEFAULT_EMPTY_STATE;
}

export function useColumn({ columnId }: UseColumnOptions) {
  const selectTasks = useMemo(
    () => makeSelectTasksByColumnId(columnId),
    [columnId],
  );

  const tasks = useStore(useShallow(selectTasks));
  const activeFilter = useStore(selectActiveFilter);
  const searchTerm = useStore(selectSearchTerm);
  const selectedTaskIds = useStore(selectSelectedTaskIds);
  const onToggleAllTasksSelection = useStore(selectToggleAllTaskSelection);

  const selectedTaskIdSet = useMemo(
    () => new Set(selectedTaskIds),
    [selectedTaskIds],
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          matchesActiveFilter(task.isComplete, activeFilter) &&
          matchesSearchTerm(task.title, searchTerm),
      ),
    [tasks, activeFilter, searchTerm],
  );

  const visibleTaskIds = useMemo(
    () => visibleTasks.map((task) => task.id),
    [visibleTasks],
  );

  const selectedVisibleTaskCount = useMemo(
    () => visibleTasks.filter((task) => selectedTaskIdSet.has(task.id)).length,
    [visibleTasks, selectedTaskIdSet],
  );

  const allTasksSelected =
    visibleTasks.length > 0 && selectedVisibleTaskCount === visibleTasks.length;

  const handleToggleAllTasksSelection = useCallback(() => {
    onToggleAllTasksSelection(visibleTaskIds);
  }, [onToggleAllTasksSelection, visibleTaskIds]);

  const hasActiveTaskFilters =
    activeFilter !== "all" || searchTerm.trim().length > 0;

  const emptyState = useMemo(
    () =>
      getEmptyState(tasks.length, visibleTasks.length, hasActiveTaskFilters),
    [tasks.length, visibleTasks.length, hasActiveTaskFilters],
  );

  return {
    emptyState,
    visibleTaskIds,
    allTasksSelected,
    hasTaskContent: visibleTasks.length > 0,
    showSelectionToggle: visibleTasks.length > 0,
    handleToggleAllTasksSelection,
  };
}
