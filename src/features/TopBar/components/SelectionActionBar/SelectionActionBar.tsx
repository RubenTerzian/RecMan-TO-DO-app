import { Button } from "@/components/atoms/Button/Button";
import { Select } from "@/components/atoms/Select/Select";
import styles from "./SelectionActionBar.module.css";
import type { SelectionBulkActionsState } from "@/features/TopBar/types";

type SelectionActionBarProps = {
  selectionCount: number;
  bulkActions: SelectionBulkActionsState;
};

export function SelectionActionBar({
  selectionCount,
  bulkActions,
}: SelectionActionBarProps) {
  return (
    <section
      className={styles.selectionActionBar}
      data-testid="selection-action-bar"
    >
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>Bulk update</h3>
          <p className={styles.caption}>Apply changes to the selected tasks.</p>
        </div>
        <span className={styles.selectionPill}>{selectionCount} selected</span>
      </div>

      <div className={styles.content}>
        <div className={styles.actionGroup}>
          <Button className={styles.secondaryAction}>Mark complete</Button>
          <Button className={styles.secondaryAction}>Mark incomplete</Button>
          <Button className={styles.dangerAction}>Delete</Button>
        </div>

        <div className={styles.moveGroup}>
          <span className={styles.moveLabel}>Move to</span>
          <Select
            className={styles.moveSelect}
            defaultValue={bulkActions.moveTargetId ?? ""}
          >
            <option value="" disabled>
              Select column
            </option>
            {bulkActions.availableColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </Select>
          <Button className={styles.moveAction}>Move</Button>
        </div>
      </div>
    </section>
  );
}
