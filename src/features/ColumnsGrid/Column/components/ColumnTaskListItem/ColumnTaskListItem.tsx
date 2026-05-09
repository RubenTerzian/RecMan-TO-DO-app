import { memo, useCallback } from "react";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import {
  useTaskDragAndDropContext,
  useTaskPreview,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { TaskDropOverlay } from "../TaskDropOverlay/TaskDropOverlay";
import styles from "../../Column.module.css";

type ColumnTaskListItemProps = {
  selectionMode: boolean;
  taskId: string;
};

function ColumnTaskListItemComponent({
  selectionMode,
  taskId,
}: ColumnTaskListItemProps) {
  const { registerTaskElement } = useTaskDragAndDropContext();
  const preview = useTaskPreview(taskId);
  const previewTitle = preview?.title ?? "Moving task";
  const isTopPreviewActive = preview?.edge === "top";
  const isBottomPreviewActive = preview?.edge === "bottom";
  const handleTaskItemRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerTaskElement(taskId, element);
    },
    [registerTaskElement, taskId],
  );

  return (
    <div ref={handleTaskItemRef} className={styles.taskItem}>
      <TaskDropOverlay
        edge="top"
        isActive={isTopPreviewActive}
        title={previewTitle}
      />

      <TaskCard
        taskId={taskId}
        mode={selectionMode ? "selection" : "default"}
      />

      <TaskDropOverlay
        edge="bottom"
        isActive={isBottomPreviewActive}
        title={previewTitle}
      />
    </div>
  );
}

export const ColumnTaskListItem = memo(ColumnTaskListItemComponent);
