import { TaskEditor } from "@/features/Column/components/TaskEditor";
import styles from "./TaskList.module.css";
import { TaskCard } from "@/features/Column/components/TaskCard";
import type { ColumnTask } from "@/features/Column/types";

type TaskListProps = {
  tasks: ColumnTask[];
  selectionMode?: boolean;
};

export function TaskList({ tasks, selectionMode = false }: TaskListProps) {
  return (
    <div className={styles.taskList}>
      {tasks.map((task) =>
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
  );
}
