import { clsx } from "@/utils/clsx";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox/index";
import { IconButton } from "@/components/atoms/IconButton/index";

type TaskCardProps = {
  title?: string;
  meta?: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
};

export function TaskCard({
  title = "Task",
  meta = "No details",
  tag = "New",
  isComplete = false,
  isSelected = false,
  selectionMode = false,
}: TaskCardProps) {
  return (
    <article
      className={clsx(styles.taskCard, {
        [styles.completed]: isComplete,
        [styles.selected]: isSelected,
        [styles.selectionMode]: selectionMode,
      })}
      data-testid="task-card"
    >
      {!selectionMode ? (
        <button className={styles.dragHandle} data-testid="task-drag-handle" type="button" aria-label="Drag task">
          ⋮⋮
        </button>
      ) : null}

      <Checkbox
        checked={selectionMode ? isSelected : isComplete}
        data-testid="task-complete-toggle"
        aria-label={selectionMode ? "Select task" : "Toggle task completion"}
        readOnly
      />

      <div className={styles.content}>
        <div className={styles.row}>
          <strong className={styles.title} data-testid="task-title">{title}</strong>
          <span className={styles.tag}>{tag}</span>
        </div>
        <span className={styles.meta}>{meta}</span>
      </div>

      {!selectionMode ? (
        <div className={styles.actions}>
          <IconButton data-testid="task-edit">Edit</IconButton>
          <IconButton data-testid="task-delete">Delete</IconButton>
        </div>
      ) : null}
    </article>
  );
}
