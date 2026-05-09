import type { Ref } from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
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
          onDelete={handleDeleteColumn}
          onEdit={handleStartEditing}
          onToggleAllSelection={handleToggleAllTasksSelection}
          title={title}
        />
      )}

      {!selectionMode ? (
        <>
          <Button
            className={styles.addTaskButton}
            data-testid="add-task-button"
            disabled={isCreatingTask}
            onClick={isCreatingTask ? undefined : handleStartTaskCreation}
          >
            Add task
          </Button>
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
    </section>
  );
}

export const Column = memo(ColumnComponent);
