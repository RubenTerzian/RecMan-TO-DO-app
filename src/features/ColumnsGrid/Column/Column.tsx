import type { PointerEventHandler, Ref } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal/ConfirmationModal";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { ColumnTaskListItem } from "@/features/ColumnsGrid/Column/components/ColumnTaskListItem/ColumnTaskListItem";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { EmptyColumnDropState } from "@/features/ColumnsGrid/Column/components/EmptyColumnDropState/EmptyColumnDropState";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import { useTaskDragAndDropContext } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import {
  useColumnDropIndicatorEdge,
  useIsColumnDragging,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { useColumnTaskCreation } from "./hooks/useColumnTaskCreation";
import { useColumnEditing } from "./hooks/useColumnEditing";
import { useColumnTasks } from "./hooks/useColumnTasks";

type ColumnProps = {
  columnId: string;
  title: string;
  selectionMode?: boolean;
  columnRef?: Ref<HTMLElement>;
  dragHandleRef?: Ref<HTMLElement>;
};

function ColumnComponent({
  columnId,
  title,
  selectionMode = false,
  columnRef,
  dragHandleRef,
}: ColumnProps) {
  const {
    emptyState,
    visibleTaskIds,
    totalTaskCount,
    allTasksSelected,
    hasTaskContent,
    showSelectionToggle,
    handleToggleAllTasksSelection,
  } = useColumnTasks({ columnId });

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const {
    draftTitle,
    isEditing,
    handleCancelEditing,
    handleDeleteColumn,
    handleDraftTitleChange,
    handleEditorBlur,
    handleSaveEditing,
    handleStartEditing,
  } = useColumnEditing({ columnId, title });

  const {
    draftTaskTitle,
    isCreatingTask,
    handleCancelTaskCreation,
    handleSaveTaskCreation,
    handleStartTaskCreation,
    handleTaskEditorBlur,
    handleTaskTitleChange,
  } = useColumnTaskCreation({ columnId });

  const { registerEmptyColumnDropTarget, registerTaskListElement } =
    useTaskDragAndDropContext();

  const dropIndicatorEdge = useColumnDropIndicatorEdge(columnId);
  const isDragging = useIsColumnDragging(columnId);
  const hasVisibleTaskCards = visibleTaskIds.length > 0;

  const handleAddTaskButtonPointerDown: PointerEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!isCreatingTask) {
      return;
    }

    event.preventDefault();
  };

  const handleCancelDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
  }, []);

  const handleConfirmDeleteColumn = useCallback(() => {
    handleDeleteColumn();
    setIsDeleteConfirmationOpen(false);
  }, [handleDeleteColumn]);

  const handleRequestDeleteColumn = useCallback(() => {
    if (totalTaskCount === 0) {
      handleDeleteColumn();
      return;
    }

    setIsDeleteConfirmationOpen(true);
  }, [handleDeleteColumn, totalTaskCount]);

  const deleteConfirmationDescription = useMemo(() => {
    const taskLabel = totalTaskCount === 1 ? "task" : "tasks";

    return `This column contains ${totalTaskCount} ${taskLabel}. Deleting it will also permanently remove all ${taskLabel}, including any currently hidden by search or filters.`;
  }, [totalTaskCount]);

  return (
    <section
      ref={columnRef}
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-dragging={isDragging || undefined}
      data-testid="column-card"
    >
      {dropIndicatorEdge ? (
        <span
          className={clsx(styles.dropIndicator, {
            [styles.dropIndicatorLeft]: dropIndicatorEdge === "left",
            [styles.dropIndicatorRight]: dropIndicatorEdge === "right",
          })}
          data-testid="column-drop-indicator"
        />
      ) : null}

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
          dragHandleRef={dragHandleRef}
          showSelectionToggle={showSelectionToggle}
          onDelete={handleRequestDeleteColumn}
          onEdit={handleStartEditing}
          onToggleAllSelection={handleToggleAllTasksSelection}
          title={title}
        />
      )}

      {!selectionMode ? (
        <>
          <div onPointerDown={handleAddTaskButtonPointerDown}>
            <Button
              className={styles.addTaskButton}
              data-testid="add-task-button"
              disabled={isCreatingTask}
              onClick={isCreatingTask ? undefined : handleStartTaskCreation}
            >
              Add task
            </Button>
          </div>
        </>
      ) : null}

      <div className={styles.taskViewport}>
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

        {hasTaskContent && hasVisibleTaskCards ? (
          <div
            ref={(element) => {
              registerTaskListElement(columnId, element);
            }}
            className={styles.taskList}
          >
            {visibleTaskIds.map((taskId) => (
              <ColumnTaskListItem
                key={taskId}
                selectionMode={selectionMode}
                taskId={taskId}
              />
            ))}
          </div>
        ) : !isCreatingTask ? (
          <EmptyColumnDropState
            columnId={columnId}
            emptyState={emptyState}
            registerEmptyColumnDropTarget={registerEmptyColumnDropTarget}
          />
        ) : null}
      </div>

      <ConfirmationModal
        cancelLabel="Keep column"
        confirmLabel="Delete column"
        description={deleteConfirmationDescription}
        isOpen={isDeleteConfirmationOpen}
        onCancel={handleCancelDeleteConfirmation}
        onConfirm={handleConfirmDeleteColumn}
        title="Delete this column?"
      />
    </section>
  );
}

export const Column = memo(ColumnComponent);
