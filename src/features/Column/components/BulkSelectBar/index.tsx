import styles from "./BulkSelectBar.module.css";

type BulkSelectBarProps = {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
};

export function BulkSelectBar({
  selectedCount,
  totalCount,
  allSelected,
}: BulkSelectBarProps) {
  return (
    <div className={styles.bulkSelectBar} data-testid="bulk-select-bar">
      <button className={styles.toggleButton} type="button">
        {allSelected ? "Deselect all" : "Select all"}
      </button>
      <span className={styles.summaryText}>
        {selectedCount} of {totalCount} selected
      </span>
    </div>
  );
}
