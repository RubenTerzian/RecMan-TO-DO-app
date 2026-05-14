import { memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import { selectColumnTitle } from "@/store/selectors";
import { useVisibleTaskIds } from "@/features/ColumnsGrid/Column/hooks/useVisibleTaskIds";
import styles from "./ColumnSelectionHeader.module.css";

type ColumnSelectionHeaderProps = {
  columnId: string;
};

type SelectAllState = "none" | "partial" | "all";

function ColumnSelectionHeaderComponent({
  columnId,
}: ColumnSelectionHeaderProps) {
  const selectTitle = useMemo(() => selectColumnTitle(columnId), [columnId]);
  const title = useStore(selectTitle);
  const visibleTaskIds = useVisibleTaskIds(columnId);

  // Subscribe to a derived primitive: re-renders only when this column's
  // selection summary actually changes.
  const selectAllState = useStore<SelectAllState>((state) => {
    if (visibleTaskIds.length === 0) {
      return "none";
    }

    const selected = state.selectedTaskIds;
    let matches = 0;

    for (const id of visibleTaskIds) {
      if (selected.includes(id)) {
        matches += 1;
      }
    }

    if (matches === 0) {
      return "none";
    }

    return matches === visibleTaskIds.length ? "all" : "partial";
  });

  const handleToggle = useCallback(() => {
    useStore.getState().toggleAllTaskSelection(visibleTaskIds);
  }, [visibleTaskIds]);

  const hasVisibleTasks = visibleTaskIds.length > 0;

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
