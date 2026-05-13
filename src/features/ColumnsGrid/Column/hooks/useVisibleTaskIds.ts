import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/store";
import { makeSelectTasksByColumnId } from "@/store/selectors";
import type { TaskFilter } from "@/features/TopBar/types";

function matchesSearchTerm(title: string, searchTerm: string) {
  const normalized = searchTerm.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return title.toLowerCase().includes(normalized);
}

function matchesActiveFilter(isComplete: boolean, activeFilter: TaskFilter) {
  if (activeFilter === "complete") {
    return isComplete;
  }

  if (activeFilter === "incomplete") {
    return !isComplete;
  }

  return true;
}

/**
 * Returns the ids of tasks in this column that pass the active filter and
 * search term. Subscribes only to the slices it needs so unrelated state
 * changes (selection, edits in other columns, etc.) do not re-run.
 */
export function useVisibleTaskIds(columnId: string) {
  const selectTasks = useMemo(
    () => makeSelectTasksByColumnId(columnId),
    [columnId],
  );
  const tasks = useStore(useShallow(selectTasks));
  const activeFilter = useStore((state) => state.activeFilter);
  const searchTerm = useStore((state) => state.searchTerm);

  return useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            matchesActiveFilter(task.isComplete, activeFilter) &&
            matchesSearchTerm(task.title, searchTerm),
        )
        .map((task) => task.id),
    [tasks, activeFilter, searchTerm],
  );
}
