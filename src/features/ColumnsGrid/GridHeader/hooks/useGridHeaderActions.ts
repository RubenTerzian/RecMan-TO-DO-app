import type { AvailableColumnOption } from "../types";
import { useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import {
  selectColumns,
  selectDeleteSelectedTasks,
  selectMarkSelectedTasksComplete,
  selectMoveSelectedTasks,
  selectSelectedTaskCount,
  selectSelectionMode,
  selectToggleSelectionMode,
} from "@/store/selectors";

function mapAvailableColumns(
  columns: Array<{ id: string; title: string }>,
): AvailableColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    label: column.title,
  }));
}

export function useGridHeaderActions() {
  const selectionMode = useStore(selectSelectionMode);
  const columns = useStore(selectColumns);
  const selectionCount = useStore(selectSelectedTaskCount);
  const toggleSelectionMode = useStore(selectToggleSelectionMode);
  const markSelectedTasksComplete = useStore(selectMarkSelectedTasksComplete);
  const deleteSelectedTasks = useStore(selectDeleteSelectedTasks);
  const moveSelectedTasks = useStore(selectMoveSelectedTasks);

  const [moveTargetId, setMoveTargetId] = useState<string | undefined>();

  const availableColumns = useMemo(
    () => mapAvailableColumns(columns),
    [columns],
  );

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
