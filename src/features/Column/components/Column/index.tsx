import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { BulkSelectBar } from "@/features/Column/components/BulkSelectBar/index";
import { ColumnHeader } from "@/features/Column/components/ColumnHeader/index";
import { ColumnActions } from "@/features/Column/components/ColumnActions/index";
import { EmptyColumnState } from "@/features/Column/components/EmptyColumnState/index";
import { MobileReorderMenu } from "@/features/Column/components/MobileReorderMenu/index";
import { TaskList } from "@/features/Column/components/TaskList/index";

type ColumnTask = {
  id: string;
  title: string;
  meta: string;
  tag: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

type ColumnProps = {
  title?: string;
  subtitle?: string;
  taskCount?: number;
  status?: string;
  meta?: string;
  tasks?: ColumnTask[];
  selectionMode?: boolean;
  showMobileReorderMenu?: boolean;
  emptyMessage?: string;
};

export function Column({
  title = "Column",
  subtitle = "General queue",
  taskCount = 0,
  status = "New",
  meta = "No activity yet",
  tasks = [],
  selectionMode = false,
  showMobileReorderMenu = false,
  emptyMessage = "No tasks yet",
}: ColumnProps) {
  const selectedCount = tasks.filter((task) => task.isSelected).length;

  return (
    <section
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-testid="column-card"
    >
      <ColumnHeader title={title} subtitle={subtitle} taskCount={taskCount} />

      {selectionMode ? (
        <BulkSelectBar selectedCount={selectedCount} totalCount={tasks.length} />
      ) : null}

      {showMobileReorderMenu ? <MobileReorderMenu /> : null}

      {!selectionMode ? <ColumnActions status={status} meta={meta} /> : null}

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} selectionMode={selectionMode} />
      ) : (
        <EmptyColumnState message={emptyMessage} testId="empty-column-drop-target" />
      )}
    </section>
  );
}
