import { memo, useCallback } from "react";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import { useTaskDragAndDropContext } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import styles from "../../Column.module.css";

type ColumnTaskListItemProps = {
  taskId: string;
};

function ColumnTaskListItemComponent({ taskId }: ColumnTaskListItemProps) {
  const { registerTaskElement } = useTaskDragAndDropContext();
  const handleTaskItemRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerTaskElement(taskId, element);
    },
    [registerTaskElement, taskId],
  );

  return (
    <div ref={handleTaskItemRef} className={styles.taskItem}>
      <TaskCard taskId={taskId} />
    </div>
  );
}

export const ColumnTaskListItem = memo(ColumnTaskListItemComponent);
