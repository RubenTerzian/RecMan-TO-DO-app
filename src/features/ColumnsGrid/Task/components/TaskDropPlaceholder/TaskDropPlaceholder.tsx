import { memo } from "react";
import styles from "./TaskDropPlaceholder.module.css";

type TaskDropPlaceholderProps = {
  height: number;
};

function TaskDropPlaceholderComponent({ height }: TaskDropPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.placeholder}
      data-task-drop-placeholder="true"
      style={{ height: `${height}px` }}
    />
  );
}

export const TaskDropPlaceholder = memo(TaskDropPlaceholderComponent);
