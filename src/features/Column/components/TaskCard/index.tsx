import { clsx } from "@/utils/clsx";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton";

type TaskCardProps = {
  title?: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
};

export function TaskCard({
  title = "Task",
  isComplete = false,
  isSelected = false,
  selectionMode = false,
}: TaskCardProps) {
  return (
    <article
      className={clsx(styles.taskCard, {
        [styles.completed]: isComplete,
        [styles.draggableCard]: !selectionMode,
        [styles.selected]: isSelected,
        [styles.selectionMode]: selectionMode,
      })}
      data-testid="task-card"
    >
      {!selectionMode ? (
        <button
          className={styles.dragHandle}
          data-testid="task-drag-handle"
          type="button"
          aria-label="Drag task"
        >
          <img
            src={dragHandleIcon}
            alt=""
            aria-hidden="true"
            className={styles.dragIcon}
          />
        </button>
      ) : null}

      <Checkbox
        checked={selectionMode ? isSelected : isComplete}
        data-testid="task-complete-toggle"
        aria-label={selectionMode ? "Select task" : "Toggle task completion"}
        readOnly
      />

      <div className={styles.content}>
        <strong className={styles.title} data-testid="task-title">
          {title}
        </strong>
      </div>

      {!selectionMode ? (
        <div className={styles.actions}>
          <EditIconButton data-testid="task-edit" aria-label="Edit task" />

          <DeleteIconButton
            data-testid="task-delete"
            aria-label="Delete task"
          />
        </div>
      ) : null}
    </article>
  );
}
