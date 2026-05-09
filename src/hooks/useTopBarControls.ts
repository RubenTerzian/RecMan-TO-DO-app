import { useCallback, useMemo, useState } from "react";
import type {
  AvailableColumnOption,
  TaskFilter,
} from "@/features/TopBar/types";
import { useStore } from "@/store/store";

function mapAvailableColumns(
  columns: Array<{ id: string; title: string }>,
): AvailableColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    label: column.title,
  }));
}

export function useTopBarControls() {
  const selectionMode = useStore((state) => state.selectionMode);
  const searchTerm = useStore((state) => state.searchTerm);
  const activeFilter = useStore((state) => state.activeFilter);
  const columns = useStore((state) => state.columns);
  const selectionCount = useStore((state) => state.selectedTaskIds.length);
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const setActiveFilter = useStore((state) => state.setActiveFilter);
  const toggleSelectionMode = useStore((state) => state.toggleSelectionMode);
  const markSelectedTasksComplete = useStore(
    (state) => state.markSelectedTasksComplete,
  );
  const deleteSelectedTasks = useStore((state) => state.deleteSelectedTasks);
  const moveSelectedTasks = useStore((state) => state.moveSelectedTasks);
  const [moveTargetId, setMoveTargetId] = useState<string | undefined>();

  const availableColumns = useMemo(
    () => mapAvailableColumns(columns),
    [columns],
  );

  const handleSearchTermChange = useCallback(
    (nextSearchTerm: string) => {
      setSearchTerm(nextSearchTerm);
    },
    [setSearchTerm],
  );

  const handleActiveFilterChange = useCallback(
    (nextActiveFilter: TaskFilter) => {
      setActiveFilter(nextActiveFilter);
    },
    [setActiveFilter],
  );

  const handleSelectionModeToggle = useCallback(() => {
    if (selectionMode) {
      setMoveTargetId(undefined);
    }

    toggleSelectionMode();
  }, [selectionMode, toggleSelectionMode]);

  const handleMoveTargetChange = useCallback((columnId: string) => {
    setMoveTargetId(columnId || undefined);
  }, []);

  const handleMarkSelectedTasksComplete = useCallback(() => {
    markSelectedTasksComplete(true);
    setMoveTargetId(undefined);
  }, [markSelectedTasksComplete]);

  const handleMarkSelectedTasksIncomplete = useCallback(() => {
    markSelectedTasksComplete(false);
    setMoveTargetId(undefined);
  }, [markSelectedTasksComplete]);

  const handleDeleteSelectedTasks = useCallback(() => {
    deleteSelectedTasks();
    setMoveTargetId(undefined);
  }, [deleteSelectedTasks]);

  const handleMoveSelectedTasks = useCallback(() => {
    if (!moveTargetId) {
      return;
    }

    moveSelectedTasks(moveTargetId);
    setMoveTargetId(undefined);
  }, [moveSelectedTasks, moveTargetId]);

  return {
    selectionMode,
    searchTerm,
    activeFilter,
    selectionCount,
    availableColumns,
    moveTargetId,
    onSearchTermChange: handleSearchTermChange,
    onActiveFilterChange: handleActiveFilterChange,
    onSelectionModeToggle: handleSelectionModeToggle,
    onMoveTargetChange: handleMoveTargetChange,
    onMarkSelectedTasksComplete: handleMarkSelectedTasksComplete,
    onMarkSelectedTasksIncomplete: handleMarkSelectedTasksIncomplete,
    onDeleteSelectedTasks: handleDeleteSelectedTasks,
    onMoveSelectedTasks: handleMoveSelectedTasks,
  };
}
