import { memo } from "react";
import { Input } from "@/components/atoms/Input/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { useInlineTitleEditorForm } from "@/hooks/useInlineTitleEditorForm";
import styles from "./ColumnEditor.module.css";

type ColumnEditorProps = {
  /**
   * Pre-existing title shown in edit mode (and selected on mount).
   * Ignored in create mode — the input opens empty with a placeholder.
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
          onKeyDown={handleInputKeyDown}
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
