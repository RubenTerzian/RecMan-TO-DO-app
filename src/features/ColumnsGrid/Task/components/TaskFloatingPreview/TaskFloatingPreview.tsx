import { memo } from "react";
import { useTaskFloatingPreview } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import styles from "./TaskFloatingPreview.module.css";

function TaskFloatingPreviewComponent() {
  const preview = useTaskFloatingPreview();

  if (!preview) {
    return null;
  }

  const x = preview.clientX - preview.offsetX;
  const y = preview.clientY - preview.offsetY;

  return (
    <div
      className={styles.floatingPreview}
      data-testid="task-floating-preview"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: preview.width ? `${preview.width}px` : undefined,
      }}
    >
      <strong className={styles.title}>{preview.title}</strong>
    </div>
  );
}

export const TaskFloatingPreview = memo(TaskFloatingPreviewComponent);
