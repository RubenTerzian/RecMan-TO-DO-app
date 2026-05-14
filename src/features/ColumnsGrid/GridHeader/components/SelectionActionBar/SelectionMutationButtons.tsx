import { memo, useCallback, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/atoms/Button/Button";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal/ConfirmationModal";
import styles from "./SelectionActionBar.module.css";

function SelectionMutationButtonsComponent() {
  const selectedCount = useStore((state) => state.selectedTaskIds.length);
  const hasSelection = selectedCount > 0;
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);

  const handleMarkComplete = useCallback(() => {
    useStore.getState().markSelectedTasksComplete(true);
  }, []);

  const handleMarkIncomplete = useCallback(() => {
    useStore.getState().markSelectedTasksComplete(false);
  }, []);

  const handleDeleteRequest = useCallback(() => {
    if (selectedCount <= 1) {
      // Single-task deletes happen immediately. Confirmation is only used
      // for bulk destructive actions, mirroring the column-with-tasks
      // pattern in ColumnDefaultHeaderArea.
      useStore.getState().deleteSelectedTasks();
      return;
    }

    setIsDeleteConfirmationOpen(true);
  }, [selectedCount]);

  const handleConfirmDelete = useCallback(() => {
    useStore.getState().deleteSelectedTasks();
    setIsDeleteConfirmationOpen(false);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
  }, []);

  const deleteDescription = useMemo(() => {
    const taskLabel = selectedCount === 1 ? "task" : "tasks";

    return `You're about to permanently delete ${selectedCount} ${taskLabel}. This action cannot be undone.`;
  }, [selectedCount]);

  return (
    <>
      <div className={styles.actionGroup}>
        <Button
          variant="secondary"
          className={styles.secondaryAction}
          disabled={!hasSelection}
          onClick={handleMarkComplete}
        >
          Mark complete
        </Button>
        <Button
          variant="secondary"
          className={styles.secondaryAction}
          disabled={!hasSelection}
          onClick={handleMarkIncomplete}
        >
          Mark incomplete
        </Button>
        <Button
          variant="danger"
          className={styles.dangerAction}
          disabled={!hasSelection}
          onClick={handleDeleteRequest}
        >
          Delete
        </Button>
      </div>

      <ConfirmationModal
        cancelLabel="Keep tasks"
        confirmLabel={`Delete ${selectedCount} tasks`}
        description={deleteDescription}
        isOpen={isDeleteConfirmationOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedCount} selected tasks?`}
      />
    </>
  );
}

export const SelectionMutationButtons = memo(SelectionMutationButtonsComponent);
