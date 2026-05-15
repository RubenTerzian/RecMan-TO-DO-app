import { CircleAddButton } from "@/components/shared/CircleAddButton/CircleAddButton";
import { useTaskCreationContext } from "@/features/ColumnsGrid/Column/context/taskCreationContext";
import { memo, useCallback } from "react";

type AddTaskButtonProps = {
  /** Used only for the accessibility label. */
  columnTitle: string;
};

/**
 * Leaf subscriber for the per-column task-creation gate. Sits inside
 * `ColumnHeader` but reads its own state, so the header (and the
 * surrounding `Column` / `ColumnTaskList`) never re-renders when the
 * editor opens or closes.
 */
export function AddTaskButtonComponent({ columnTitle }: AddTaskButtonProps) {
  const { isCreatingTask, handleStartTaskCreation } = useTaskCreationContext();

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isCreatingTask) {
        return;
      }

      event.preventDefault();
    },
    [isCreatingTask],
  );

  return (
    <CircleAddButton
      aria-label={`Add task to ${columnTitle}`}
      disabled={isCreatingTask}
      onClick={handleStartTaskCreation}
      onPointerDown={handlePointerDown}
    />
  );
}

export const AddTaskButton = memo(AddTaskButtonComponent);
