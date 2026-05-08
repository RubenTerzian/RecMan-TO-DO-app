import { Input } from "@/components/atoms/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton";
import styles from "./TaskEditor.module.css";

type TaskEditorProps = {
  title?: string;
  mode?: "create" | "edit";
};

export function TaskEditor({ title = "", mode = "create" }: TaskEditorProps) {
  const isCreateMode = mode === "create";

  return (
    <article className={styles.taskEditor} data-testid="task-editor">
      <Input
        aria-label={isCreateMode ? "New task name" : "Edit task name"}
        className={styles.input}
        defaultValue={title}
        placeholder={isCreateMode ? "New task" : "Edit task"}
      />

      <div className={styles.actions}>
        <CancelIconButton
          aria-label={isCreateMode ? "Cancel new task" : "Cancel task edit"}
          data-testid="cancel-task-editor"
        />
        <SaveIconButton
          aria-label={isCreateMode ? "Save new task" : "Save task changes"}
          data-testid="save-task-editor"
        />
      </div>
    </article>
  );
}
