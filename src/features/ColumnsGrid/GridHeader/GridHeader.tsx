import type { PointerEventHandler } from "react";
import { CreateColumnButton } from "@/components/shared/CreateColumnButton/CreateColumnButton";
import { SelectionActionBar } from "@/features/ColumnsGrid/GridHeader/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/ColumnsGrid/GridHeader/components/SelectionModeToggle/SelectionModeToggle";
import styles from "./GridHeader.module.css";
import { useGridHeaderActions } from "./hooks/useGridHeaderActions";

type GridHeaderProps = {
  isCreateColumnDisabled?: boolean;
  onCreateColumn?(): void;
};

export function GridHeader({
  isCreateColumnDisabled = false,
  onCreateColumn,
}: GridHeaderProps) {
  const handleCreateColumnPointerDown: PointerEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!isCreateColumnDisabled) {
      return;
    }

    event.preventDefault();
  };

  const {
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
  } = useGridHeaderActions();

  return (
    <header className={styles.gridHeader} data-testid="grid-header">
      <div className={styles.actionsRow}>
        <SelectionModeToggle
          className={styles.selectionModeButton}
          enabled={selectionMode}
          onToggle={handleSelectionModeToggle}
        />

        {!selectionMode ? (
          <div
            className={styles.createColumnButtonWrapper}
            onPointerDown={handleCreateColumnPointerDown}
          >
            <CreateColumnButton
              className={styles.createColumnButton}
              disabled={isCreateColumnDisabled}
              onClick={isCreateColumnDisabled ? undefined : onCreateColumn}
            />
          </div>
        ) : null}
      </div>

      {selectionMode ? (
        <SelectionActionBar
          className={styles.selectionActionBar}
          availableColumns={availableColumns}
          moveTargetId={moveTargetId}
          selectionCount={selectionCount}
          onMoveTargetChange={handleMoveTargetChange}
          onMarkComplete={handleMarkSelectedTasksComplete}
          onMarkIncomplete={handleMarkSelectedTasksIncomplete}
          onDelete={handleDeleteSelectedTasks}
          onMove={handleMoveSelectedTasks}
        />
      ) : null}
    </header>
  );
}
