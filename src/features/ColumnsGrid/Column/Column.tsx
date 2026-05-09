import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import type { ColumnEmptyState } from "@/features/ColumnsGrid/Column/types";
import { useStore } from "@/store/store";
import type { Task } from "@/store/types";

type ColumnProps = {
  title: string;
  tasks: Task[];
  selectionMode?: boolean;
  onToggleTaskCompletion(taskId: string): void;
  onToggleTaskSelection(taskId: string): void;
  onToggleColumnTaskSelection(taskIds: string[]): void;
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

function matchesSearchTerm(title: string, searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return title.toLowerCase().includes(normalizedSearchTerm);
}

function matchesActiveFilter(
  isComplete: boolean,
  activeFilter: ReturnType<typeof useStore.getState>["activeFilter"],
) {
  if (activeFilter === "complete") {
    return isComplete;
  }

  if (activeFilter === "incomplete") {
    return !isComplete;
  }

  return true;
}

function getEmptyState(
  totalTaskCount: number,
  visibleTaskCount: number,
  hasActiveTaskFilters: boolean,
) {
  if (totalTaskCount > 0 && visibleTaskCount === 0 && hasActiveTaskFilters) {
    return NO_RESULTS_EMPTY_STATE;
  }

  return DEFAULT_EMPTY_STATE;
}

function ColumnComponent({
  title,
  tasks,
  selectionMode = false,
  onToggleTaskCompletion,
  onToggleTaskSelection,
  onToggleColumnTaskSelection,
}: ColumnProps) {
  const activeFilter = useStore((state) => state.activeFilter);
  const searchTerm = useStore((state) => state.searchTerm);
  const selectedTaskIds = useStore((state) => state.selectedTaskIds);

  const selectedTaskIdSet = useMemo(
    () => new Set(selectedTaskIds),
    [selectedTaskIds],
  );
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          matchesActiveFilter(task.isComplete, activeFilter) &&
          matchesSearchTerm(task.title, searchTerm),
      ),
    [tasks, activeFilter, searchTerm],
  );
  const hasTaskContent = visibleTasks.length > 0;

  const selectedTaskCount = useMemo(
    () => visibleTasks.filter((task) => selectedTaskIdSet.has(task.id)).length,
    [visibleTasks, selectedTaskIdSet],
  );
  const allTasksSelected =
    visibleTasks.length > 0 && selectedTaskCount === visibleTasks.length;
  const visibleTaskIds = useMemo(
    () => visibleTasks.map((task) => task.id),
    [visibleTasks],
  );
  const handleColumnTaskSelection = useCallback(() => {
    onToggleColumnTaskSelection(visibleTaskIds);
  }, [onToggleColumnTaskSelection, visibleTaskIds]);
  const hasActiveTaskFilters =
    activeFilter !== "all" || searchTerm.trim().length > 0;
  const emptyState = useMemo(
    () =>
      getEmptyState(tasks.length, visibleTasks.length, hasActiveTaskFilters),
    [tasks.length, visibleTasks.length, hasActiveTaskFilters],
  );

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      <ColumnHeader
        mode={selectionMode ? "selection" : "default"}
        allSelected={allTasksSelected}
        showSelectionToggle={visibleTasks.length > 0}
        onToggleSelection={handleColumnTaskSelection}
        title={title}
      />

      {!selectionMode ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {hasTaskContent ? (
        <div className={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              taskId={task.id}
              mode={selectionMode ? "selection" : "default"}
              title={task.title}
              isComplete={task.isComplete}
              isSelected={selectedTaskIdSet.has(task.id)}
              onToggleComplete={onToggleTaskCompletion}
              onToggleSelection={onToggleTaskSelection}
            />
          ))}
        </div>
      ) : (
        <EmptyColumnState
          variant={emptyState?.variant}
          title={emptyState?.title}
          message={emptyState?.message}
          testId="empty-column-drop-target"
        />
      )}
    </section>
  );
}

export const Column = memo(ColumnComponent);
