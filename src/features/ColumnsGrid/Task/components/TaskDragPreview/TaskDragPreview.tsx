import { memo } from "react";
import styles from "./TaskDragPreview.module.css";

type TaskDragPreviewProps = {
  title: string;
};

function TaskDragPreviewComponent({ title }: TaskDragPreviewProps) {
  return (
    <div className={styles.previewWrapper}>
      <span
        className={styles.dropIndicator}
        data-testid="task-drop-indicator"
      />

      <div className={styles.dragPreview} data-testid="task-drag-preview">
        <span className={styles.label}>Moving task</span>
        <strong className={styles.title}>{title}</strong>
      </div>
    </div>
  );
}

export const TaskDragPreview = memo(TaskDragPreviewComponent);
