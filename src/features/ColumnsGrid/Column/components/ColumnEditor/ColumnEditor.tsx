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
import styles from "./ColumnEditor.module.css";

type ColumnEditorProps = {
  draftTitle: string;
  mode: "create" | "edit";
  autoFocus?: boolean;
  onBlur?: FocusEventHandler<HTMLFormElement>;
  onCancel(): void;
  onDraftTitleChange(title: string): void;
  onSave(): void;
};

function ColumnEditorComponent({
  draftTitle,
  mode,
  autoFocus = false,
  onBlur,
  onCancel,
  onDraftTitleChange,
  onSave,
}: ColumnEditorProps) {
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
      className={styles.columnEditor}
      onBlur={onBlur}
      onSubmit={handleSubmit}
    >
      <div className={styles.headerRow}>
        <Input
          aria-label={isCreateMode ? "New column name" : "Edit column name"}
          autoFocus={autoFocus}
          className={styles.titleInput}
          onChange={(event) => onDraftTitleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
          placeholder={isCreateMode ? "New column" : "Rename column"}
          value={draftTitle}
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
