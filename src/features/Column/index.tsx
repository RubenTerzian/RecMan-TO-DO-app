import { Button } from "@/components/atoms/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/Column/components/ColumnEditor";
import { ColumnHeader } from "@/features/Column/components/ColumnHeader";
import { EmptyColumnState } from "@/features/Column/components/EmptyColumnState";
import { TaskList } from "@/features/Column/components/TaskList";
import type { ColumnData } from "@/features/Column/types";

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
          {...(selectionMode
            ? {
                mode: "selection" as const,
                allSelected: allTasksSelected,
                showSelectionToggle: selectableTasks.length > 0,
                title: column.title,
              }
            : {
                mode: "default" as const,
                title: column.title,
              })}
        />
      )}

      {!selectionMode && !isColumnEditor && !hasTaskEditor ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {column.tasks.length > 0 ? (
        <TaskList tasks={column.tasks} selectionMode={selectionMode} />
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
