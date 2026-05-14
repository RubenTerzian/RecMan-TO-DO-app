import type { Ref } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal/ConfirmationModal";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { useColumnEditing } from "@/features/ColumnsGrid/Column/hooks/useColumnEditing";
import { selectColumnTitle } from "@/store/selectors";

type ColumnDefaultHeaderAreaProps = {
  columnId: string;
  isAddTaskDisabled: boolean;
  onAddTask(): void;
  dragHandleRef: Ref<HTMLElement>;
};

function getColumnTaskCount(columnId: string) {
  return useStore
    .getState()
    .tasks.reduce(
      (count, task) => (task.columnId === columnId ? count + 1 : count),
      0,
    );
}

function ColumnDefaultHeaderAreaComponent({
  columnId,
  isAddTaskDisabled,
  onAddTask,
  dragHandleRef,
}: ColumnDefaultHeaderAreaProps) {
  const selectTitle = useMemo(() => selectColumnTitle(columnId), [columnId]);
  const title = useStore(selectTitle);
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

  const [pendingDeleteCount, setPendingDeleteCount] = useState<number | null>(
    null,
  );

  const handleCancelDeleteConfirmation = useCallback(() => {
    setPendingDeleteCount(null);
  }, []);

  const handleConfirmDeleteColumn = useCallback(() => {
    handleDeleteColumn();
    setPendingDeleteCount(null);
  }, [handleDeleteColumn]);

  const handleRequestDeleteColumn = useCallback(() => {
    const taskCount = getColumnTaskCount(columnId);

    if (taskCount === 0) {
      handleDeleteColumn();
      return;
    }

    setPendingDeleteCount(taskCount);
  }, [columnId, handleDeleteColumn]);

  const deleteConfirmationDescription = useMemo(() => {
    if (pendingDeleteCount === null) {
      return "";
    }

    const taskLabel = pendingDeleteCount === 1 ? "task" : "tasks";

    return `This column contains ${pendingDeleteCount} ${taskLabel}. Deleting it will also permanently remove all ${taskLabel}, including any currently hidden by search or filters.`;
  }, [pendingDeleteCount]);

  if (isEditing) {
    return (
      <ColumnEditor
        autoFocus
        draftTitle={draftTitle}
        mode="edit"
        onBlur={handleEditorBlur}
        onCancel={handleCancelEditing}
        onDraftTitleChange={handleDraftTitleChange}
        onSave={handleSaveEditing}
      />
    );
  }

  return (
    <>
      <ColumnHeader
        dragHandleRef={dragHandleRef}
        isAddTaskDisabled={isAddTaskDisabled}
        onAddTask={onAddTask}
        onDelete={handleRequestDeleteColumn}
        onEdit={handleStartEditing}
        title={title}
      />

      <ConfirmationModal
        cancelLabel="Keep column"
        confirmLabel="Delete column"
        description={deleteConfirmationDescription}
        isOpen={pendingDeleteCount !== null}
        onCancel={handleCancelDeleteConfirmation}
        onConfirm={handleConfirmDeleteColumn}
        title="Delete this column?"
      />
    </>
  );
}

export const ColumnDefaultHeaderArea = memo(ColumnDefaultHeaderAreaComponent);
