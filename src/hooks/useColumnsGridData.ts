import { useCallback, useMemo } from "react";
import { selectColumnsForDisplay } from "@/store/selectors";
import { useStore } from "@/store/store";

export function useColumnsGridData() {
  const columns = useStore((state) => state.columns);
  const tasks = useStore((state) => state.tasks);
  const selectedTaskIds = useStore((state) => state.selectedTaskIds);
  const activeFilter = useStore((state) => state.activeFilter);
  const searchTerm = useStore((state) => state.searchTerm);
  const selectionMode = useStore((state) => state.selectionMode);
  const toggleTaskSelection = useStore((state) => state.toggleTaskSelection);
  const toggleColumnTaskSelection = useStore(
    (state) => state.toggleColumnTaskSelection,
  );
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);

  const displayColumns = useMemo(
    () =>
      selectColumnsForDisplay(
        columns,
        tasks,
        activeFilter,
        searchTerm,
        selectedTaskIds,
      ),
    [columns, tasks, activeFilter, searchTerm, selectedTaskIds],
  );

  const handleTaskSelectionToggle = useCallback(
    (taskId: string) => {
      toggleTaskSelection(taskId);
    },
    [toggleTaskSelection],
  );

  const handleColumnTaskSelectionToggle = useCallback(
    (taskIds: string[]) => {
      toggleColumnTaskSelection(taskIds);
    },
    [toggleColumnTaskSelection],
  );

  const handleTaskCompletionToggle = useCallback(
    (taskId: string) => {
      toggleTaskCompletion(taskId);
    },
    [toggleTaskCompletion],
  );

  return {
    columns: displayColumns,
    selectionMode,
    onTaskSelectionToggle: handleTaskSelectionToggle,
    onColumnTaskSelectionToggle: handleColumnTaskSelectionToggle,
    onTaskCompletionToggle: handleTaskCompletionToggle,
  };
}
