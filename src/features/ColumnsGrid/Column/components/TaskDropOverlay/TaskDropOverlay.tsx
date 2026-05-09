import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "../../Column.module.css";

type TaskDropOverlayProps = {
  edge: "top" | "bottom";
  isActive: boolean;
  title: string;
};

function TaskDropOverlayComponent({
  edge,
  isActive,
  title,
}: TaskDropOverlayProps) {
  return (
    <div
      className={clsx(styles.taskDropSlot, {
        [styles.taskDropSlotActive]: isActive,
        [styles.taskDropSlotTop]: edge === "top",
        [styles.taskDropSlotBottom]: edge === "bottom",
      })}
    >
      <div className={styles.taskDropSlotInner}>
        <span
          className={styles.taskDropIndicator}
          data-testid="task-drop-indicator"
        />

        <div className={styles.taskDropPreview} data-testid="task-drag-preview">
          <span className={styles.taskDropLabel}>Moving task</span>
          <strong className={styles.taskDropTitle}>{title}</strong>
        </div>
      </div>
    </div>
  );
}

export const TaskDropOverlay = memo(TaskDropOverlayComponent);
