import { CircleAddButton } from "@/components/shared/CircleAddButton/CircleAddButton";
import { useTaskCreationContext } from "@/features/ColumnsGrid/Column/context/taskCreationContext";

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
export function AddTaskButton({ columnTitle }: AddTaskButtonProps) {
  const { isCreatingTask, handleStartTaskCreation } = useTaskCreationContext();

  return (
    <CircleAddButton
      aria-label={`Add task to ${columnTitle}`}
      disabled={isCreatingTask}
      onClick={isCreatingTask ? undefined : handleStartTaskCreation}
    />
  );
}
