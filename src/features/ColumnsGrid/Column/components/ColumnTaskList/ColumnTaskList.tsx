import { Fragment, memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import { ColumnTaskListItem } from "@/features/ColumnsGrid/Column/components/ColumnTaskListItem/ColumnTaskListItem";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskDropPlaceholder } from "@/features/ColumnsGrid/Task/components/TaskDropPlaceholder/TaskDropPlaceholder";
import {
  useColumnDropPlacement,
  useDragSourceColumnId,
  useDraggingTaskId,
  useTaskDragAndDropContext,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useVisibleTaskIds } from "@/features/ColumnsGrid/Column/hooks/useVisibleTaskIds";
import { makeSelectColumnTaskCount } from "@/store/selectors";
import styles from "../../Column.module.css";

type ColumnTaskListProps = {
  columnId: string;
  selectionMode: boolean;
};

const DEFAULT_EMPTY_STATE = {
  variant: "empty",
  title: "No tasks yet",
  message: "Add your first task to start filling this column.",
} as const;

const NO_RESULTS_EMPTY_STATE = {
  variant: "no-results",
  title: "No matching tasks",
  message: "Try a different search or filter to see tasks here.",
} as const;

function ColumnTaskListComponent({
  columnId,
  selectionMode,
}: ColumnTaskListProps) {
  const allVisibleTaskIds = useVisibleTaskIds(columnId);
  const totalTaskCount = useStore(makeSelectColumnTaskCount(columnId));
  const placement = useColumnDropPlacement(columnId);
  const draggingTaskId = useDraggingTaskId();
  const dragSourceColumnId = useDragSourceColumnId();
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
    // Suppress the empty/no-results message only in the column the
    // task originates from (its slot is conceptually held by the ghost).
    // Other columns keep their normal empty messaging unless this column
    // is the active drop target, in which case the placeholder takes over.
    const isSourceColumn = dragSourceColumnId === columnId;

    if (placement) {
      return (
        <div ref={handleTaskListRef} className={styles.taskList}>
          <TaskDropPlaceholder height={placement.height} />
        </div>
      );
    }

    if (isSourceColumn) {
      return <div ref={handleTaskListRef} className={styles.taskList} />;
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
