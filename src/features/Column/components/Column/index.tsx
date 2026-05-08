import { Button } from "@/components/atoms/Button/index";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnHeader } from "@/features/Column/components/ColumnHeader/index";
import { EmptyColumnState } from "@/features/Column/components/EmptyColumnState/index";
import { MobileReorderMenu } from "@/features/Column/components/MobileReorderMenu/index";
import { TaskList } from "@/features/Column/components/TaskList/index";

type ColumnTask = {
  id: string;
  title: string;
  tag: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

type ColumnProps = {
  title?: string;
  subtitle?: string;
  tasks?: ColumnTask[];
  selectionMode?: boolean;
  showMobileReorderMenu?: boolean;
  emptyMessage?: string;
};

export function Column({
  title = "Column",
  tasks = [],
  selectionMode = false,
  showMobileReorderMenu = false,
  emptyMessage = "No tasks yet",
}: ColumnProps) {
  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      <ColumnHeader title={title} selectionMode={selectionMode} />

      {!selectionMode ? (
        <Button className={styles.addTaskButton} data-testid="add-task-button">
          Add task
        </Button>
      ) : null}

      {showMobileReorderMenu ? <MobileReorderMenu /> : null}

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} selectionMode={selectionMode} />
      ) : (
        <EmptyColumnState
          message={emptyMessage}
          testId="empty-column-drop-target"
        />
      )}
    </section>
  );
}
