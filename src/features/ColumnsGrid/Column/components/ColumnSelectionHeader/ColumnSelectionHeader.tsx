import { memo } from "react";
import styles from "../ColumnHeader/ColumnHeader.module.css";
import { ColumnSelectAllToggle } from "../ColumnSelectAllToggle/ColumnSelectAllToggle";

type ColumnSelectionHeaderProps = {
  columnId: string;
  title: string;
};

function ColumnSelectionHeaderComponent({
  columnId,
  title,
}: ColumnSelectionHeaderProps) {
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
