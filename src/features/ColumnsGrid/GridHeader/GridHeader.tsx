import { AddColumnButton } from "@/features/ColumnsGrid/GridHeader/components/AddColumnButton/AddColumnButton";
import { SelectionActionBar } from "@/features/ColumnsGrid/GridHeader/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/ColumnsGrid/GridHeader/components/SelectionModeToggle/SelectionModeToggle";
import {
  selectHasColumns,
  selectSelectionMode,
  selectToggleSelectionMode,
} from "@/store/selectors";
import { useStore } from "@/store/store";
import styles from "./GridHeader.module.css";

/**
 * Stateless layout for the board header. Subscribes to two booleans
 * (selection mode + has-columns) so column reordering and content
 * changes never propagate here. The "Add Column" trigger is a leaf
 * consumer of `<ColumnCreationProvider>` (`AddColumnButton`), so this
 * component also stays put when the column-creation editor toggles.
 */
export function GridHeader() {
  const hasColumns = useStore(selectHasColumns);
  const selectionMode = useStore(selectSelectionMode);
  const toggleSelectionMode = useStore(selectToggleSelectionMode);

  return (
    <header className={styles.gridHeader}>
      <div className={styles.actionsRow}>
        {hasColumns ? (
          <SelectionModeToggle
            className={styles.selectionModeButton}
            enabled={selectionMode}
            onToggle={toggleSelectionMode}
          />
        ) : null}

        {!selectionMode ? <AddColumnButton /> : null}
      </div>

      {selectionMode && hasColumns ? (
        <SelectionActionBar className={styles.selectionActionBar} />
      ) : null}
    </header>
  );
}
