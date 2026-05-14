import type { PointerEventHandler } from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import { useColumnTaskCreation } from "@/features/ColumnsGrid/Column/hooks/useColumnTaskCreation";
import styles from "../../Column.module.css";

type ColumnAddTaskControlProps = {
  columnId: string;
};

function ColumnAddTaskControlComponent({
  columnId,
}: ColumnAddTaskControlProps) {
  const {
    draftTaskTitle,
    isCreatingTask,
    handleCancelTaskCreation,
    handleSaveTaskCreation,
    handleStartTaskCreation,
    handleTaskEditorBlur,
    handleTaskTitleChange,
  } = useColumnTaskCreation({ columnId });

  const handleAddTaskButtonPointerDown: PointerEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!isCreatingTask) {
      return;
    }

    event.preventDefault();
  };

  return (
    <>
      <div onPointerDown={handleAddTaskButtonPointerDown}>
        <Button
          className={styles.addTaskButton}
          disabled={isCreatingTask}
          onClick={isCreatingTask ? undefined : handleStartTaskCreation}
        >
          Add task
        </Button>
      </div>

      {isCreatingTask ? (
        <TaskEditor
          autoFocus
          mode="create"
          onBlur={handleTaskEditorBlur}
          onCancel={handleCancelTaskCreation}
          onSave={handleSaveTaskCreation}
          onTitleChange={handleTaskTitleChange}
          title={draftTaskTitle}
        />
      ) : null}
    </>
  );
}

export const ColumnAddTaskControl = memo(ColumnAddTaskControlComponent);
