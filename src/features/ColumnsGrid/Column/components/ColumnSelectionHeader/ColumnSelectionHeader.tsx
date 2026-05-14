import { memo, useMemo } from "react";
import styles from "../ColumnHeader/ColumnHeader.module.css";
import { useStore } from "@/store/store";
import { selectColumnTitle } from "@/store/selectors";
import { ColumnSelectAllToggle } from "../ColumnSelectAllToggle/ColumnSelectAllToggle";

type ColumnSelectionHeaderProps = {
  columnId: string;
};

function ColumnSelectionHeaderComponent({
  columnId,
}: ColumnSelectionHeaderProps) {
  const selectTitle = useMemo(
    () => selectColumnTitle(columnId),
    [columnId],
  );
  const title = useStore(selectTitle);

  return (
    <header className={styles.columnHeader}>
      <div className={styles.titleGroup}>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <ColumnSelectAllToggle
        className={styles.selectionToggle}
        columnId={columnId}
      />
    </header>
  );
}

export const ColumnSelectionHeader = memo(ColumnSelectionHeaderComponent);
