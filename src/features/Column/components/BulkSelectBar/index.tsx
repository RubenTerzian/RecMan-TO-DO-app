import styles from "./BulkSelectBar.module.css";

type BulkSelectBarProps = {
  selectedCount: number;
  totalCount: number;
};

export function BulkSelectBar({ selectedCount, totalCount }: BulkSelectBarProps) {
  return (
    <div className={styles.bulkSelectBar} data-testid="bulk-select-bar">
      <span>{selectedCount} selected</span>
      <span>{totalCount} visible</span>
    </div>
  );
}
