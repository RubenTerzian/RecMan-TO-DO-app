import { memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import {
  selectColumnTitle,
  selectHasVisibleTasksByColumn,
  selectVisibleColumnTaskSelectionState,
} from "@/store/selectors";
import styles from "./ColumnSelectionHeader.module.css";

type ColumnSelectionHeaderProps = {
  columnId: string;
};

function ColumnSelectionHeaderComponent({
  columnId,
}: ColumnSelectionHeaderProps) {
  const selectTitle = useMemo(() => selectColumnTitle(columnId), [columnId]);
  const selectHasVisibleTasks = useMemo(
    () => selectHasVisibleTasksByColumn(columnId),
    [columnId],
  );
  const selectSelectionState = useMemo(
    () => selectVisibleColumnTaskSelectionState(columnId),
    [columnId],
  );
  const title = useStore(selectTitle);
  const hasVisibleTasks = useStore(selectHasVisibleTasks);
  const selectAllState = useStore(selectSelectionState);

  const handleToggle = useCallback(() => {
    useStore.getState().toggleAllColumnTaskSelection(columnId);
  }, [columnId]);

  return (
    <header className={styles.columnSelectionHeader}>
      <Checkbox
        shape="square"
        aria-label={
          selectAllState === "all"
            ? `Deselect all visible tasks in ${title}`
            : `Select all visible tasks in ${title}`
        }
        checked={selectAllState === "all"}
        indeterminate={selectAllState === "partial"}
        disabled={!hasVisibleTasks}
        onChange={handleToggle}
      />
      <h3 className={styles.title}>{title}</h3>
    </header>
  );
}

export const ColumnSelectionHeader = memo(ColumnSelectionHeaderComponent);
