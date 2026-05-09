import { CreateColumnButton } from "@/components/shared/CreateColumnButton/CreateColumnButton";
import { SelectionActionBar } from "@/features/ColumnsGrid/GridHeader/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/ColumnsGrid/GridHeader/components/SelectionModeToggle/SelectionModeToggle";
import styles from "./GridHeader.module.css";
import { useGridHeaderActions } from "./hooks/useGridHeaderActions";

export function GridHeader() {
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
          <CreateColumnButton className={styles.createColumnButton} />
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
