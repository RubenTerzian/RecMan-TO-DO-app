import { memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import { ColumnTaskListItem } from "@/features/ColumnsGrid/Column/components/ColumnTaskListItem/ColumnTaskListItem";
import { EmptyColumnDropState } from "@/features/ColumnsGrid/Column/components/EmptyColumnDropState/EmptyColumnDropState";
import { useTaskDragAndDropContext } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useVisibleTaskIds } from "@/features/ColumnsGrid/Column/hooks/useVisibleTaskIds";
import { makeSelectTasksByColumnId } from "@/store/selectors";
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
  const visibleTaskIds = useVisibleTaskIds(columnId);
  const selectTasks = useMemo(
    () => makeSelectTasksByColumnId(columnId),
    [columnId],
  );
  const totalTaskCount = useStore(
    useShallow((state) => selectTasks(state).length),
  );
  const { registerEmptyColumnDropTarget, registerTaskListElement } =
    useTaskDragAndDropContext();

  const handleTaskListRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerTaskListElement(columnId, element);
    },
    [columnId, registerTaskListElement],
  );

  if (visibleTaskIds.length > 0) {
    return (
      <div ref={handleTaskListRef} className={styles.taskList}>
        {visibleTaskIds.map((taskId) => (
          <ColumnTaskListItem
            key={taskId}
            selectionMode={selectionMode}
            taskId={taskId}
          />
        ))}
      </div>
    );
  }

  const emptyState =
    totalTaskCount > 0 ? NO_RESULTS_EMPTY_STATE : DEFAULT_EMPTY_STATE;

  return (
    <EmptyColumnDropState
      columnId={columnId}
      emptyState={emptyState}
      registerEmptyColumnDropTarget={registerEmptyColumnDropTarget}
    />
  );
}

export const ColumnTaskList = memo(ColumnTaskListComponent);
