import type { FocusEvent } from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import { useColumnEditing } from "./hooks/useColumnEditing";
import { useColumnTasks } from "./hooks/useColumnTasks";

type ColumnProps = {
  columnId: string;
  title: string;
  selectionMode?: boolean;
};

function ColumnComponent({
  columnId,
  title,
  selectionMode = false,
}: ColumnProps) {
  const {
    emptyState,
    visibleTaskIds,
    allTasksSelected,
    hasTaskContent,
    showSelectionToggle,
    handleToggleAllTasksSelection,
  } = useColumnTasks({ columnId });
  const {
    draftTitle,
    isEditing,
    handleCancelEditing,
    handleDeleteColumn,
    handleDraftTitleChange,
    handleSaveEditing,
    handleStartEditing,
  } = useColumnEditing({ columnId, title });

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

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      {isEditing ? (
        <ColumnEditor
          autoFocus
          draftTitle={draftTitle}
          mode="edit"
          onBlur={handleEditorBlur}
          onCancel={handleCancelEditing}
          onDraftTitleChange={handleDraftTitleChange}
          onSave={handleSaveEditing}
        />
      ) : (
        <ColumnHeader
          mode={selectionMode ? "selection" : "default"}
          allSelected={allTasksSelected}
          showSelectionToggle={showSelectionToggle}
          onDelete={handleDeleteColumn}
          onEdit={handleStartEditing}
          onToggleAllSelection={handleToggleAllTasksSelection}
          title={title}
        />
      )}

      {!selectionMode ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {hasTaskContent ? (
        <div className={styles.taskList}>
          {visibleTaskIds.map((taskId) => (
            <TaskCard
              key={taskId}
              taskId={taskId}
              mode={selectionMode ? "selection" : "default"}
            />
          ))}
        </div>
      ) : (
        <EmptyColumnState
          variant={emptyState?.variant}
          title={emptyState?.title}
          message={emptyState?.message}
          testId="empty-column-drop-target"
        />
      )}
    </section>
  );
}

export const Column = memo(ColumnComponent);
