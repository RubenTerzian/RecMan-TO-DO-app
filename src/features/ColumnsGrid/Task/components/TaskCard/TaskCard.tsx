import { memo, useCallback } from "react";
import { clsx } from "@/utils/clsx";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import styles from "./TaskCard.module.css";
import { Checkbox } from "@/components/atoms/Checkbox/Checkbox";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { useTaskDragAndDropContext } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useTaskEditing } from "@/features/ColumnsGrid/Task/hooks/useTaskEditing";
import { useTask } from "@/features/ColumnsGrid/Task/hooks/useTask";

type TaskCardProps = {
  taskId: string;
};

function TaskCardComponent({ taskId }: TaskCardProps) {
  const {
    task,
    titleSegments,
    selectionMode,
    isSelected,
    isComplete,
    handleToggle,
  } = useTask({ taskId });

  const {
    draftTitle,
    isEditing,
    handleCancelEditing,
    handleDeleteTask,
    handleEditorBlur,
    handleSaveEditing,
    handleStartEditing,
    handleTitleChange,
  } = useTaskEditing({ taskId, title: task?.title ?? "" });

  const { registerTaskDragHandle } = useTaskDragAndDropContext();
  const handleCardRef = useCallback(
    (element: HTMLElement | null) => {
      registerTaskDragHandle(taskId, element);
    },
    [registerTaskDragHandle, taskId],
  );

  if (!task) {
    return null;
  }

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
      ref={!selectionMode ? handleCardRef : undefined}
      className={clsx(styles.taskCard, {
        [styles.completed]: isComplete,
        [styles.draggableCard]: !selectionMode,
        [styles.selected]: isSelected,
        [styles.selectionMode]: selectionMode,
      })}
    >
      {!selectionMode ? (
        <button
          className={styles.dragHandle}
          data-drag-handle="true"
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
        aria-label={selectionMode ? "Select task" : "Toggle task completion"}
        onChange={handleToggle}
      />

      <div className={styles.content}>
        <strong className={styles.title}>
          {titleSegments.map((segment, index) =>
            segment.isMatch ? (
              <mark
                key={`${task.id}-segment-${index}`}
                className={styles.titleMatch}
              >
                {segment.text}
              </mark>
            ) : (
              <span key={`${task.id}-segment-${index}`}>{segment.text}</span>
            ),
          )}
        </strong>
      </div>

      {!selectionMode ? (
        <div className={styles.actions}>
          <EditIconButton
            aria-label="Edit task"
            onClick={handleStartEditing}
          />

          <DeleteIconButton
            aria-label="Delete task"
            onClick={handleDeleteTask}
          />
        </div>
      ) : null}
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
