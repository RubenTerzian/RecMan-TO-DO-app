import { CreateColumnButton } from "@/components/shared/CreateColumnButton/CreateColumnButton";
import styles from "./TopBar.module.css";
import { SearchInput } from "@/features/TopBar/components/SearchInput/SearchInput";
import { FilterControls } from "@/features/TopBar/components/FilterControls/FilterControls";
import { SelectionActionBar } from "@/features/TopBar/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/TopBar/components/SelectionModeToggle/SelectionModeToggle";
import { useTopBarControls } from "@/hooks/useTopBarControls";

export function TopBar() {
  const {
    selectionMode,
    searchTerm,
    activeFilter,
    selectionCount,
    availableColumns,
    moveTargetId,
    onSearchTermChange,
    onActiveFilterChange,
    onSelectionModeToggle,
    onMoveTargetChange,
    onMarkSelectedTasksComplete,
    onMarkSelectedTasksIncomplete,
    onDeleteSelectedTasks,
    onMoveSelectedTasks,
  } = useTopBarControls();

  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.controlsCard}>
        <div className={styles.controls}>
          <SearchInput value={searchTerm} onChange={onSearchTermChange} />
          <FilterControls
            activeFilter={activeFilter}
            onChange={onActiveFilterChange}
          />

          <div className={styles.actionsGroup}>
            <SelectionModeToggle
              enabled={selectionMode}
              onToggle={onSelectionModeToggle}
            />

            {!selectionMode ? <CreateColumnButton /> : null}
          </div>
        </div>

        {selectionMode ? (
          <SelectionActionBar
            availableColumns={availableColumns}
            moveTargetId={moveTargetId}
            selectionCount={selectionCount}
            onMoveTargetChange={onMoveTargetChange}
            onMarkComplete={onMarkSelectedTasksComplete}
            onMarkIncomplete={onMarkSelectedTasksIncomplete}
            onDelete={onDeleteSelectedTasks}
            onMove={onMoveSelectedTasks}
          />
        ) : null}
      </div>
    </header>
  );
}
