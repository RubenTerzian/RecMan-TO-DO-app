import { Button } from "@/components/atoms/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor";
import type { ColumnData } from "@/features/ColumnsGrid/Column/types";

type ColumnProps = {
  column: ColumnData;
  selectionMode?: boolean;
};

export function Column({ column, selectionMode = false }: ColumnProps) {
  const hasTaskEditor = column.tasks.some(
    (task) => task.kind === "task-editor",
  );
  const selectableTasks = column.tasks.filter((task) => task.kind === "task");
  const selectedTasks = selectableTasks.filter((task) => task.isSelected);
  const allTasksSelected =
    selectableTasks.length > 0 &&
    selectedTasks.length === selectableTasks.length;
  const isColumnEditor = column.kind === "editor";
  const emptyState =
    column.kind === "editor" && column.mode === "create"
      ? {
          variant: "empty" as const,
          title: "New column",
          message: "Save this column to start adding tasks.",
        }
      : column.emptyState;

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      {isColumnEditor ? (
        <ColumnEditor draftTitle={column.draftTitle} mode={column.mode} />
      ) : (
        <ColumnHeader
          mode={selectionMode ? "selection" : "default"}
          allSelected={allTasksSelected}
          showSelectionToggle={selectableTasks.length > 0}
          title={column.title}
        />
      )}

      {!selectionMode && !isColumnEditor && !hasTaskEditor ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {column.tasks.length > 0 ? (
        <div className={styles.taskList}>
          {column.tasks.map((task) =>
            task.kind === "task-editor" ? (
              <TaskEditor key={task.id} title={task.title} mode={task.mode} />
            ) : (
              <TaskCard
                key={task.id}
                mode={selectionMode ? "selection" : "default"}
                title={task.title}
                tag={task.tag}
                isComplete={task.isComplete}
                isSelected={task.isSelected}
              />
            ),
          )}
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
