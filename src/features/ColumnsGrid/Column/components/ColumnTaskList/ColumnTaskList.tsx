import { Fragment, memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import { ColumnTaskListItem } from "@/features/ColumnsGrid/Column/components/ColumnTaskListItem/ColumnTaskListItem";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskDropPlaceholder } from "@/features/ColumnsGrid/Task/components/TaskDropPlaceholder/TaskDropPlaceholder";
import {
  useColumnDropPlacement,
  useDraggingTaskId,
  useTaskDragAndDropContext,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useVisibleTaskIds } from "@/features/ColumnsGrid/Column/hooks/useVisibleTaskIds";
import { makeSelectColumnTaskCount } from "@/store/selectors";
import type { ColumnEmptyState } from "@/features/ColumnsGrid/Column/types";
import styles from "../../Column.module.css";

type ColumnTaskListProps = {
  columnId: string;
  selectionMode: boolean;
};

const DEFAULT_EMPTY_STATE: ColumnEmptyState = {
  variant: "empty",
  title: "No tasks yet",
  message: "Add your first task to start filling this column.",
};

const NO_RESULTS_EMPTY_STATE: ColumnEmptyState = {
  variant: "no-results",
  title: "No matching tasks",
  message: "Try a different search or filter to see tasks here.",
};

function ColumnTaskListComponent({
  columnId,
  selectionMode,
}: ColumnTaskListProps) {
  const allVisibleTaskIds = useVisibleTaskIds(columnId);
  const totalTaskCount = useStore(makeSelectColumnTaskCount(columnId));
  const placement = useColumnDropPlacement(columnId);
  const draggingTaskId = useDraggingTaskId();
  const { registerColumnDropZone } = useTaskDragAndDropContext();

  // Hide the dragged task from its own column while dragging — the
  // placeholder represents where it would land.
  const visibleTaskIds = useMemo(() => {
    if (!draggingTaskId) {
      return allVisibleTaskIds;
    }

    const filtered = allVisibleTaskIds.filter((id) => id !== draggingTaskId);

    return filtered.length === allVisibleTaskIds.length
      ? allVisibleTaskIds
      : filtered;
  }, [allVisibleTaskIds, draggingTaskId]);

  const handleTaskListRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerColumnDropZone(columnId, element);
    },
    [columnId, registerColumnDropZone],
  );

  if (visibleTaskIds.length === 0) {
    if (draggingTaskId) {
      // While a drag is in progress, never show empty-state messaging.
      // Render only the placeholder when this column is the active target.
      return (
        <div ref={handleTaskListRef} className={styles.taskList}>
          {placement ? <TaskDropPlaceholder height={placement.height} /> : null}
        </div>
      );
    }

    const emptyState =
      totalTaskCount > 0 ? NO_RESULTS_EMPTY_STATE : DEFAULT_EMPTY_STATE;

    return (
      <div ref={handleTaskListRef} className={styles.taskList}>
        <EmptyColumnState
          variant={emptyState.variant}
          title={emptyState.title}
          message={emptyState.message}
        />
      </div>
    );
  }

  const placementIndex = placement
    ? Math.max(0, Math.min(placement.index, visibleTaskIds.length))
    : -1;

  return (
    <div ref={handleTaskListRef} className={styles.taskList}>
      {visibleTaskIds.map((taskId, index) => (
        <Fragment key={taskId}>
          {placementIndex === index && placement ? (
            <TaskDropPlaceholder height={placement.height} />
          ) : null}
          <ColumnTaskListItem selectionMode={selectionMode} taskId={taskId} />
        </Fragment>
      ))}
      {placementIndex === visibleTaskIds.length && placement ? (
        <TaskDropPlaceholder height={placement.height} />
      ) : null}
    </div>
  );
}

export const ColumnTaskList = memo(ColumnTaskListComponent);
