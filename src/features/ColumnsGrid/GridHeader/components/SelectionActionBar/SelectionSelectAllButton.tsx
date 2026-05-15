import { memo, useCallback } from "react";
import {
  selectHasVisibleTasks,
  selectVisibleTaskSelectionState,
} from "@/store/selectors";
import { useStore } from "@/store/store";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./SelectionActionBar.module.css";

function SelectionToggleButtonComponent() {
  const hasVisibleTasks = useStore(selectHasVisibleTasks);
  const visibleSelectionState = useStore(selectVisibleTaskSelectionState);

  const handleToggleAllTaskSelection = useCallback(() => {
    useStore.getState().toggleAllVisibleTaskSelection();
  }, []);

  return (
    <>
      <div className={styles.actionGroup}>
        <Button
          variant="secondary"
          className={styles.secondaryAction}
          disabled={!hasVisibleTasks}
          onClick={handleToggleAllTaskSelection}
        >
          {visibleSelectionState === "all" ? "Deselect all" : "Select all"}
        </Button>
      </div>
    </>
  );
}

export const SelectionToggleButton = memo(SelectionToggleButtonComponent);
