import type { AvailableColumnOption } from "../types";
import { useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";

function mapAvailableColumns(
  columns: Array<{ id: string; title: string }>,
): AvailableColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    label: column.title,
  }));
}

export function useGridHeaderActions() {
  const {
    selectionMode,
    columns,
    selectedTaskIds,
    toggleSelectionMode,
    markSelectedTasksComplete,
    deleteSelectedTasks,
    moveSelectedTasks,
  } = useStore();

  const [moveTargetId, setMoveTargetId] = useState<string | undefined>();

  const availableColumns = useMemo(
    () => mapAvailableColumns(columns),
    [columns],
  );
  const selectionCount = selectedTaskIds.length;

  const handleSelectionModeToggle = useCallback(() => {
    if (selectionMode) {
      setMoveTargetId(undefined);
    }

    toggleSelectionMode();
  }, [selectionMode, toggleSelectionMode]);

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

  const handleMoveTargetChange = useCallback((targetId: string) => {
    setMoveTargetId(targetId);
  }, []);

  return {
    moveTargetId,
    availableColumns,
    selectionMode,
    selectionCount,
    handleMoveTargetChange,
    handleSelectionModeToggle,
    handleMarkSelectedTasksComplete,
    handleMarkSelectedTasksIncomplete,
    handleDeleteSelectedTasks,
    handleMoveSelectedTasks,
  };
}
