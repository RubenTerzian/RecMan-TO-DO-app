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
import styles from "./ColumnEditor.module.css";

type ColumnEditorProps = {
  /**
   * Initial value seeded into the uncontrolled input. Editing happens
   * entirely inside the editor — the parent never sees keystrokes.
   */
  initialTitle: string;
  mode: "create" | "edit";
  autoFocus?: boolean;
  /**
   * Receives the final title on submit. The editor reads its own
   * input value, so this fires once per save, never per keystroke.
   */
  onSave(title: string): void;
  onCancel(): void;
};

function ColumnEditorComponent({
  initialTitle,
  mode,
  autoFocus = false,
  onSave,
  onCancel,
}: ColumnEditorProps) {
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

  // Focus-safe blur: only collapse the editor when focus leaves the
  // entire form surface. Focus shifts between the input and the
  // action buttons must not cancel.
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
      className={styles.columnEditor}
      onBlur={handleBlur}
      onSubmit={handleSubmit}
    >
      <div className={styles.headerRow}>
        <Input
          ref={inputRef}
          aria-label={isCreateMode ? "New column name" : "Edit column name"}
          autoFocus={autoFocus}
          className={styles.titleInput}
          defaultValue={isCreateMode ? undefined : initialTitle}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          placeholder={isCreateMode ? "Enter column name" : "Rename column"}
        />

        <div className={styles.actions}>
          <CancelIconButton
            aria-label={
              isCreateMode ? "Cancel new column" : "Cancel column edit"
            }
            onClick={onCancel}
            onPointerDown={handleActionPointerDown}
          />
          <SaveIconButton
            aria-label={
              isCreateMode ? "Save new column" : "Save column changes"
            }
            onPointerDown={handleActionPointerDown}
            type="submit"
          />
        </div>
      </div>

      <p className={styles.helperText}>
        {isCreateMode
          ? "Save the column to start dragging it and adding tasks."
          : "Save changes to restore the regular column controls."}
      </p>
    </form>
  );
}

export const ColumnEditor = memo(ColumnEditorComponent);
