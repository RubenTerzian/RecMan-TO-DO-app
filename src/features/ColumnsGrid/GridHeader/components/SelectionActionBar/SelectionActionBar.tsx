import { memo, useCallback, useMemo, type HTMLAttributes } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Select } from "@/components/atoms/Select/Select";
import { clsx } from "@/utils/clsx";
import styles from "./SelectionActionBar.module.css";
import type { AvailableColumnOption } from "@/features/ColumnsGrid/GridHeader/types";

type SelectionActionBarProps = {
  selectionCount: number;
  availableColumns: AvailableColumnOption[];
  moveTargetId?: string;
  className?: HTMLAttributes<HTMLElement>["className"];
  onMoveTargetChange(columnId: string): void;
  onMarkComplete(): void;
  onMarkIncomplete(): void;
  onDelete(): void;
  onMove(): void;
};

function SelectionActionBarComponent({
  selectionCount,
  availableColumns,
  moveTargetId,
  className,
  onMoveTargetChange,
  onMarkComplete,
  onMarkIncomplete,
  onDelete,
  onMove,
}: SelectionActionBarProps) {
  const hasSelection = selectionCount > 0;
  const handleMoveTargetSelect = useCallback(
    (event: { target: { value: string } }) => {
      onMoveTargetChange(event.target.value);
    },
    [onMoveTargetChange],
  );
  const moveOptions = useMemo(
    () => [
      <option key="placeholder" value="" disabled>
        Select column
      </option>,
      ...availableColumns.map((column) => (
        <option key={column.id} value={column.id}>
          {column.label}
        </option>
      )),
    ],
    [availableColumns],
  );

  return (
    <section
      className={clsx(styles.selectionActionBar, className)}
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
            onChange={handleMoveTargetSelect}
          >
            {moveOptions}
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

export const SelectionActionBar = memo(SelectionActionBarComponent);
