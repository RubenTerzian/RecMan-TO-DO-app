import { clsx } from "@/utils/clsx";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import editIcon from "@/assets/icons/edit.svg";
import deleteIcon from "@/assets/icons/delete.svg";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox/index";
import { IconButton } from "@/components/atoms/IconButton/index";

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
          <IconButton
            className={styles.iconAction}
            data-testid="task-edit"
            aria-label="Edit task"
          >
            <img
              src={editIcon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
          </IconButton>

          <IconButton
            className={styles.iconAction}
            data-testid="task-delete"
            aria-label="Delete task"
          >
            <img
              src={deleteIcon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
          </IconButton>
        </div>
      ) : null}
    </article>
  );
}
