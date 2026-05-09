import { memo } from "react";
import { clsx } from "@/utils/clsx";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { useTask } from "@/features/ColumnsGrid/Task/hooks/useTask";

type BaseTaskCardProps = {
  taskId: string;
};

type DefaultTaskCardProps = BaseTaskCardProps & {
  mode: "default";
};

type SelectionTaskCardProps = BaseTaskCardProps & {
  mode: "selection";
};

type TaskCardProps = DefaultTaskCardProps | SelectionTaskCardProps;

function TaskCardComponent({ taskId, ...props }: TaskCardProps) {
  const { task, selectionMode, isSelected, isComplete, handleToggle } = useTask(
    {
      taskId,
      mode: props.mode,
    },
  );

  if (!task) {
    return null;
  }

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
        onChange={handleToggle}
      />

      <div className={styles.content}>
        <strong className={styles.title} data-testid="task-title">
          {task.title}
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

export const TaskCard = memo(TaskCardComponent);
