import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import { useTaskCreationContext } from "@/features/ColumnsGrid/Column/context/TaskCreationContext";
import styles from "./TaskCreationSlot.module.css";

/**
 * Renders the task-creation editor when the per-column gate is open.
 * Subscribes to the gate at the leaf so neither `Column`,
 * `ColumnHeader`, nor `ColumnTaskList` re-render on open / close /
 * commit. The editor itself is uncontrolled, so keystrokes never
 * reach this component either.
 */
export function TaskCreationSlot() {
  const {
    isCreatingTask,
    defaultTitle,
    handleSaveTaskCreation,
    handleCancelTaskCreation,
  } = useTaskCreationContext();

  if (!isCreatingTask) {
    return null;
  }

  return (
    <div className={styles.slot}>
      <TaskEditor
        autoFocus
        mode="create"
        initialTitle={defaultTitle}
        onCancel={handleCancelTaskCreation}
        onSave={handleSaveTaskCreation}
      />
    </div>
  );
}
