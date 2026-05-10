import type {
  FocusEventHandler,
  PointerEventHandler,
  SubmitEventHandler,
} from "react";
import { memo } from "react";
import { Input } from "@/components/atoms/Input/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import styles from "./TaskEditor.module.css";

type TaskEditorProps = {
  title: string;
  autoFocus?: boolean;
  mode: "create" | "edit";
  onBlur?: FocusEventHandler<HTMLFormElement>;
  onCancel(): void;
  onSave(): void;
  onTitleChange(title: string): void;
};

function TaskEditorComponent({
  title,
  autoFocus = false,
  mode,
  onBlur,
  onCancel,
  onSave,
  onTitleChange,
}: TaskEditorProps) {
  const isCreateMode = mode === "create";

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSave();
  };

  const handleActionPointerDown: PointerEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
  };

  return (
    <form
      className={styles.taskEditor}
      data-testid="task-editor"
      onBlur={onBlur}
      onSubmit={handleSubmit}
    >
      <Input
        aria-label={isCreateMode ? "New task name" : "Edit task name"}
        autoFocus={autoFocus}
        className={styles.input}
        onChange={(event) => onTitleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        placeholder={isCreateMode ? "New task" : "Edit task"}
        value={title}
      />

      <div className={styles.actions}>
        <CancelIconButton
          aria-label={isCreateMode ? "Cancel new task" : "Cancel task edit"}
          data-testid="cancel-task-editor"
          onClick={onCancel}
          onPointerDown={handleActionPointerDown}
        />
        <SaveIconButton
          aria-label={isCreateMode ? "Save new task" : "Save task changes"}
          data-testid="save-task-editor"
          onPointerDown={handleActionPointerDown}
          type="submit"
        />
      </div>
    </form>
  );
}

export const TaskEditor = memo(TaskEditorComponent);
