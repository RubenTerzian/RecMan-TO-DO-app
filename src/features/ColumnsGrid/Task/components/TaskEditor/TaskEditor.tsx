import { memo } from "react";
import { Input } from "@/components/atoms/Input/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { useInlineTitleEditorForm } from "@/hooks/useInlineTitleEditorForm";
import styles from "./TaskEditor.module.css";

type TaskEditorProps = {
  /**
   * Pre-existing title shown in edit mode (and selected on mount).
   * Ignored in create mode — the input opens empty with a placeholder.
   */
  initialTitle: string;
  autoFocus?: boolean;
  mode: "create" | "edit";
  /**
   * Receives the final title on submit only — once per save, never
   * per keystroke.
   */
  onSave(title: string): void;
  onCancel(): void;
};

function TaskEditorComponent({
  initialTitle,
  autoFocus = false,
  mode,
  onSave,
  onCancel,
}: TaskEditorProps) {
  const {
    inputRef,
    isCreateMode,
    handleSubmit,
    handleBlur,
    handleInputKeyDown,
    handleActionPointerDown,
  } = useInlineTitleEditorForm({ mode, onSave, onCancel });

  return (
    <form
      className={styles.taskEditor}
      onBlur={handleBlur}
      onSubmit={handleSubmit}
    >
      <Input
        ref={inputRef}
        aria-label={isCreateMode ? "New task name" : "Edit task name"}
        autoFocus={autoFocus}
        className={styles.input}
        defaultValue={isCreateMode ? undefined : initialTitle}
        onKeyDown={handleInputKeyDown}
        placeholder={isCreateMode ? "Enter task name" : "Edit task"}
      />

      <div className={styles.actions}>
        <CancelIconButton
          aria-label={isCreateMode ? "Cancel new task" : "Cancel task edit"}
          onClick={onCancel}
          onPointerDown={handleActionPointerDown}
        />
        <SaveIconButton
          aria-label={isCreateMode ? "Save new task" : "Save task changes"}
          onPointerDown={handleActionPointerDown}
          type="submit"
        />
      </div>
    </form>
  );
}

export const TaskEditor = memo(TaskEditorComponent);
