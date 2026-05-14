import { AddColumnButton } from "@/features/ColumnsGrid/GridHeader/components/AddColumnButton/AddColumnButton";
import { SelectionActionBar } from "@/features/ColumnsGrid/GridHeader/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/ColumnsGrid/GridHeader/components/SelectionModeToggle/SelectionModeToggle";
import {
  selectSelectionMode,
  selectToggleSelectionMode,
} from "@/store/selectors";
import { useStore } from "@/store/store";
import styles from "./GridHeader.module.css";

type GridHeaderProps = {
  hasColumns: boolean;
};

/**
 * Stateless layout for the board header. The "Add Column" trigger is
 * a leaf consumer of `<ColumnCreationProvider>` (`AddColumnButton`),
 * so this component never re-renders when the column-creation editor
 * opens, closes, or commits.
 */
export function GridHeader({ hasColumns }: GridHeaderProps) {
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
