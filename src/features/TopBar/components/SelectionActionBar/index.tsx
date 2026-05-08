import styles from "./SelectionActionBar.module.css";

type SelectionActionBarProps = {
  selectionCount: number;
};

export function SelectionActionBar({ selectionCount }: SelectionActionBarProps) {
  return (
    <div className={styles.selectionActionBar} data-testid="selection-action-bar">
      {selectionCount} selected
    </div>
  );
}
