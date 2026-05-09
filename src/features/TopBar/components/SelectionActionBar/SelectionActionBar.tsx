import { Button } from "@/components/atoms/Button/Button";
import { Select } from "@/components/atoms/Select/Select";
import styles from "./SelectionActionBar.module.css";
import type { AvailableColumnOption } from "@/features/TopBar/types";

type SelectionActionBarProps = {
  selectionCount: number;
  availableColumns: AvailableColumnOption[];
  moveTargetId?: string;
  onMoveTargetChange(columnId: string): void;
  onMarkComplete(): void;
  onMarkIncomplete(): void;
  onDelete(): void;
  onMove(): void;
};

export function SelectionActionBar({
  selectionCount,
  availableColumns,
  moveTargetId,
  onMoveTargetChange,
  onMarkComplete,
  onMarkIncomplete,
  onDelete,
  onMove,
}: SelectionActionBarProps) {
  const hasSelection = selectionCount > 0;

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
          <Button
            className={styles.secondaryAction}
            disabled={!hasSelection}
            onClick={onMarkComplete}
          >
            Mark complete
          </Button>
          <Button
            className={styles.secondaryAction}
            disabled={!hasSelection}
            onClick={onMarkIncomplete}
          >
            Mark incomplete
          </Button>
          <Button
            className={styles.dangerAction}
            disabled={!hasSelection}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>

        <div className={styles.moveGroup}>
          <span className={styles.moveLabel}>Move to</span>
          <Select
            className={styles.moveSelect}
            value={moveTargetId ?? ""}
            onChange={(event) => onMoveTargetChange(event.target.value)}
          >
            <option value="" disabled>
              Select column
            </option>
            {availableColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </Select>
          <Button
            className={styles.moveAction}
            disabled={!hasSelection || !moveTargetId}
            onClick={onMove}
          >
            Move
          </Button>
        </div>
      </div>
    </section>
  );
}
