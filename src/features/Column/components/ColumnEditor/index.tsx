import { Input } from "@/components/atoms/Input";
import {
  CancelIconButton,
  SaveIconButton,
} from "@/components/shared/ActionIconButton";
import styles from "./ColumnEditor.module.css";

type ColumnEditorProps = {
  draftTitle?: string;
  mode?: "create" | "edit";
};

export function ColumnEditor({
  draftTitle = "",
  mode = "create",
}: ColumnEditorProps) {
  const isCreateMode = mode === "create";

  return (
    <header className={styles.columnEditor} data-testid="column-editor">
      <div className={styles.headerRow}>
        <Input
          aria-label={isCreateMode ? "New column name" : "Edit column name"}
          className={styles.titleInput}
          defaultValue={draftTitle}
          placeholder={isCreateMode ? "New column" : "Rename column"}
        />

        <div className={styles.actions}>
          <CancelIconButton
            aria-label={
              isCreateMode ? "Cancel new column" : "Cancel column edit"
            }
            data-testid="cancel-column-editor"
          />
          <SaveIconButton
            aria-label={
              isCreateMode ? "Save new column" : "Save column changes"
            }
            data-testid="save-column-editor"
          />
        </div>
      </div>

      <p className={styles.helperText}>
        {isCreateMode
          ? "Save the column to start dragging it and adding tasks."
          : "Save changes to restore the regular column controls."}
      </p>
    </header>
  );
}
