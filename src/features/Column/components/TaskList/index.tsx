import { TaskEditor } from "@/features/Column/components/TaskEditor";
import styles from "./TaskList.module.css";
import { TaskCard } from "@/features/Column/components/TaskCard";

type TaskListProps = {
  tasks: Array<{
    id: string;
    title: string;
    tag?: string;
    isComplete?: boolean;
    isSelected?: boolean;
    editorMode?: "create" | "edit";
  }>;
  selectionMode?: boolean;
};

export function TaskList({ tasks, selectionMode = false }: TaskListProps) {
  return (
    <div className={styles.taskList}>
      {tasks.map((task) =>
        task.editorMode ? (
          <TaskEditor key={task.id} title={task.title} mode={task.editorMode} />
        ) : (
          <TaskCard
            key={task.id}
            title={task.title}
            tag={task.tag}
            isComplete={task.isComplete}
            isSelected={task.isSelected}
            selectionMode={selectionMode}
          />
        ),
      )}
    </div>
  );
}
