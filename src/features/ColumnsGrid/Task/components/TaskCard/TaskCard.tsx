import type { FocusEvent } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { useTaskEditing } from "@/features/ColumnsGrid/Task/hooks/useTaskEditing";
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

  const {
    draftTitle,
    isEditing,
    handleCancelEditing,
    handleDeleteTask,
    handleSaveEditing,
    handleStartEditing,
    handleTitleChange,
  } = useTaskEditing({ taskId, title: task?.title ?? "" });

  if (!task) {
    return null;
  }

  const handleEditorBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    handleCancelEditing();
  };

  if (isEditing && !selectionMode) {
    return (
      <TaskEditor
        autoFocus
        mode="edit"
        onBlur={handleEditorBlur}
        onCancel={handleCancelEditing}
        onSave={handleSaveEditing}
        onTitleChange={handleTitleChange}
        title={draftTitle}
      />
    );
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
          <EditIconButton
            data-testid="task-edit"
            aria-label="Edit task"
            onClick={handleStartEditing}
          />

          <DeleteIconButton
            data-testid="task-delete"
            aria-label="Delete task"
            onClick={handleDeleteTask}
          />
        </div>
      ) : null}
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
