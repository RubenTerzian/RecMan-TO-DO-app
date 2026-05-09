import { Button } from "@/components/atoms/Button/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { ColumnHeader } from "@/features/ColumnsGrid/Column/components/ColumnHeader/ColumnHeader";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { TaskCard } from "@/features/ColumnsGrid/Task/components/TaskCard/TaskCard";
import { TaskEditor } from "@/features/ColumnsGrid/Task/components/TaskEditor/TaskEditor";
import type { ColumnData } from "@/features/ColumnsGrid/Column/types";

type ColumnProps = {
  column: ColumnData;
  selectionMode?: boolean;
  onToggleTaskCompletion(taskId: string): void;
  onToggleTaskSelection(taskId: string): void;
  onToggleColumnTaskSelection(taskIds: string[]): void;
};

export function Column({
  column,
  selectionMode = false,
  onToggleTaskCompletion,
  onToggleTaskSelection,
  onToggleColumnTaskSelection,
}: ColumnProps) {
  const hasTaskEditor = Boolean(column.taskEditor);
  const selectedTasks = column.tasks.filter((task) => task.isSelected);
  const allTasksSelected =
    column.tasks.length > 0 && selectedTasks.length === column.tasks.length;
  const isColumnEditor = column.kind === "editor";
  const hasTaskContent = column.tasks.length > 0 || hasTaskEditor;
  const visibleTaskIds = column.tasks.map((task) => task.id);
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
          showSelectionToggle={column.tasks.length > 0}
          onToggleSelection={() => onToggleColumnTaskSelection(visibleTaskIds)}
          title={column.title}
        />
      )}

      {!selectionMode && !isColumnEditor && !hasTaskEditor ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {hasTaskContent ? (
        <div className={styles.taskList}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              mode={selectionMode ? "selection" : "default"}
              title={task.title}
              tag={task.tag}
              isComplete={task.isComplete}
              isSelected={task.isSelected}
              onToggleComplete={() => onToggleTaskCompletion(task.id)}
              onToggleSelection={() => onToggleTaskSelection(task.id)}
            />
          ))}

          {column.taskEditor ? (
            <TaskEditor
              key={column.taskEditor.id}
              title={column.taskEditor.title}
              mode={column.taskEditor.mode}
            />
          ) : null}
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
