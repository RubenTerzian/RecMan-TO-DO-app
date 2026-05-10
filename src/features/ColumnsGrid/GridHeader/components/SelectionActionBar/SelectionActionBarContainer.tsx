import { memo, useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import {
  selectColumns,
  selectDeleteSelectedTasks,
  selectMarkSelectedTasksComplete,
  selectMoveSelectedTasks,
  selectSelectedTaskCount,
} from "@/store/selectors";
import { SelectionActionBar } from "./SelectionActionBar";
import type { AvailableColumnOption } from "../../types";

type SelectionActionBarContainerProps = {
  className?: string;
};

function mapAvailableColumns(
  columns: Array<{ id: string; title: string }>,
): AvailableColumnOption[] {
  return columns.map((column) => ({
    id: column.id,
    label: column.title,
  }));
}

function SelectionActionBarContainerComponent({
  className,
}: SelectionActionBarContainerProps) {
  const columns = useStore(selectColumns);
  const selectionCount = useStore(selectSelectedTaskCount);
  const markSelectedTasksComplete = useStore(selectMarkSelectedTasksComplete);
  const deleteSelectedTasks = useStore(selectDeleteSelectedTasks);
  const moveSelectedTasks = useStore(selectMoveSelectedTasks);
  const [moveTargetId, setMoveTargetId] = useState<string | undefined>();

  const availableColumns = useMemo(
    () => mapAvailableColumns(columns),
    [columns],
  );

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
    setMoveTargetId((currentValue) =>
      currentValue === targetId ? currentValue : targetId,
    );
  }, []);

  return (
    <SelectionActionBar
      availableColumns={availableColumns}
      className={className}
      moveTargetId={moveTargetId}
      selectionCount={selectionCount}
      onDelete={handleDeleteSelectedTasks}
      onMarkComplete={handleMarkSelectedTasksComplete}
      onMarkIncomplete={handleMarkSelectedTasksIncomplete}
      onMove={handleMoveSelectedTasks}
      onMoveTargetChange={handleMoveTargetChange}
    />
  );
}

export const SelectionActionBarContainer = memo(
  SelectionActionBarContainerComponent,
);
