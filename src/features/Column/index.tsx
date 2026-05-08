import { Button } from "@/components/atoms/Button";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnEditor } from "@/features/Column/components/ColumnEditor";
import { ColumnHeader } from "@/features/Column/components/ColumnHeader";
import { EmptyColumnState } from "@/features/Column/components/EmptyColumnState";
import { MobileReorderMenu } from "@/features/Column/components/MobileReorderMenu";
import { TaskList } from "@/features/Column/components/TaskList";
import type { ColumnEmptyState } from "@/features/Column/types";

type ColumnTask = {
  id: string;
  title: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
  editorMode?: "create" | "edit";
};

type ColumnProps = {
  title?: string;
  subtitle?: string;
  tasks?: ColumnTask[];
  selectionMode?: boolean;
  showMobileReorderMenu?: boolean;
  emptyState?: ColumnEmptyState;
  editorMode?: "create" | "edit";
  draftTitle?: string;
};

export function Column({
  title = "Column",
  tasks = [],
  selectionMode = false,
  showMobileReorderMenu = false,
  emptyState,
  editorMode,
  draftTitle,
}: ColumnProps) {
  const hasTaskEditor = tasks.some((task) => task.editorMode);
  const selectableTasks = tasks.filter((task) => !task.editorMode);
  const selectedTasks = selectableTasks.filter((task) => task.isSelected);
  const allTasksSelected =
    selectableTasks.length > 0 &&
    selectedTasks.length === selectableTasks.length;

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      {editorMode ? (
        <ColumnEditor draftTitle={draftTitle ?? title} mode={editorMode} />
      ) : (
        <ColumnHeader
          allSelected={allTasksSelected}
          selectionMode={selectionMode}
          showSelectionToggle={selectableTasks.length > 0}
          title={title}
        />
      )}

      {!selectionMode && !editorMode && !hasTaskEditor ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {showMobileReorderMenu && !editorMode ? <MobileReorderMenu /> : null}

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} selectionMode={selectionMode} />
      ) : (
        <EmptyColumnState
          variant={editorMode === "create" ? "empty" : emptyState?.variant}
          title={editorMode === "create" ? "New column" : emptyState?.title}
          message={
            editorMode === "create"
              ? "Save this column to start adding tasks."
              : emptyState?.message
          }
          testId="empty-column-drop-target"
        />
      )}
    </section>
  );
}
