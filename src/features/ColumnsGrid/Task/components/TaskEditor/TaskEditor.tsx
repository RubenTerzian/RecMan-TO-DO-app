import type {
  FocusEventHandler,
  PointerEventHandler,
  SubmitEventHandler,
} from "react";
import { memo, useCallback, useLayoutEffect, useRef } from "react";
import { Input } from "@/components/atoms/Input/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import styles from "./TaskEditor.module.css";

type TaskEditorProps = {
  /**
   * Initial value seeded into the uncontrolled input. The editor
   * owns its own draft so keystrokes never reach the parent.
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
  const isCreateMode = mode === "create";
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (isCreateMode || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isCreateMode]);

  const handleSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      onSave(inputRef.current?.value ?? "");
    },
    [onSave],
  );

  // Focus-safe blur: only collapse when focus actually leaves the form.
  const handleBlur = useCallback<FocusEventHandler<HTMLFormElement>>(
    (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) {
        return;
      }
      if (
        next === null &&
        document.activeElement instanceof Node &&
        event.currentTarget.contains(document.activeElement)
      ) {
        return;
      }
      onCancel();
    },
    [onCancel],
  );

  const handleActionPointerDown: PointerEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
  };

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
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
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
