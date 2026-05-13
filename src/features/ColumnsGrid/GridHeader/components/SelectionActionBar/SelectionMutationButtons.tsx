import { memo, useCallback } from "react";
import { useStore } from "@/store/store";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./SelectionActionBar.module.css";

function SelectionMutationButtonsComponent() {
  const hasSelection = useStore((state) => state.selectedTaskIds.length > 0);

  const handleMarkComplete = useCallback(() => {
    useStore.getState().markSelectedTasksComplete(true);
  }, []);

  const handleMarkIncomplete = useCallback(() => {
    useStore.getState().markSelectedTasksComplete(false);
  }, []);

  const handleDelete = useCallback(() => {
    useStore.getState().deleteSelectedTasks();
  }, []);

  return (
    <div className={styles.actionGroup}>
      <Button
        className={styles.secondaryAction}
        disabled={!hasSelection}
        onClick={handleMarkComplete}
      >
        Mark complete
      </Button>
      <Button
        className={styles.secondaryAction}
        disabled={!hasSelection}
        onClick={handleMarkIncomplete}
      >
        Mark incomplete
      </Button>
      <Button
        className={styles.dangerAction}
        disabled={!hasSelection}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}

export const SelectionMutationButtons = memo(SelectionMutationButtonsComponent);
