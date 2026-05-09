import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import { useColumn } from "@/features/ColumnsGrid/Column/hooks/useColumn";

type ColumnProps = {
  columnId: string;
  title: string;
  selectionMode?: boolean;
};

function ColumnComponent({
  columnId,
  title,
  selectionMode = false,
}: ColumnProps) {
  const {
    emptyState,
    visibleTaskIds,
    allTasksSelected,
    hasTaskContent,
    showSelectionToggle,
    handleToggleAllTasksSelection,
  } = useColumn({ columnId });

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      <ColumnHeader
        mode={selectionMode ? "selection" : "default"}
        allSelected={allTasksSelected}
        showSelectionToggle={showSelectionToggle}
        onToggleAllSelection={handleToggleAllTasksSelection}
        title={title}
      />

      {!selectionMode ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {hasTaskContent ? (
        <div className={styles.taskList}>
          {visibleTaskIds.map((taskId) => (
            <TaskCard
              key={taskId}
              taskId={taskId}
              mode={selectionMode ? "selection" : "default"}
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
