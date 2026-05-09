import { memo } from "react";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
import { clsx } from "@/utils/clsx";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  title: string;
  mode: "default" | "selection";
  allSelected?: boolean;
  showSelectionToggle?: boolean;
  onDelete?(): void;
  onEdit?(): void;
  onToggleAllSelection?(): void;
};

function ColumnHeaderComponent({
  title,
  mode,
  allSelected = false,
  showSelectionToggle = false,
  onDelete,
  onEdit,
  onToggleAllSelection,
}: ColumnHeaderProps) {
  const selectionMode = mode === "selection";

  return (
    <header
      className={clsx(styles.columnHeader, {
        [styles.draggableHeader]: !selectionMode,
      })}
    >
      <div className={styles.titleGroup}>
        {!selectionMode ? (
          <div className={styles.dragCue} aria-hidden="true">
            <img src={dragHandleIcon} alt="" className={styles.dragIcon} />
          </div>
        ) : null}

        <h3 className={styles.title}>{title}</h3>
      </div>

      {!selectionMode ? (
        <div className={styles.actions}>
          <EditIconButton
            data-testid="edit-column-button"
            aria-label="Edit column"
            onClick={onEdit}
          />

          <DeleteIconButton
            data-testid="delete-column-button"
            aria-label="Delete column"
            onClick={onDelete}
          />
        </div>
      ) : showSelectionToggle ? (
        <button
          className={styles.selectionToggle}
          type="button"
          onClick={onToggleAllSelection}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      ) : null}
    </header>
  );
}

export const ColumnHeader = memo(ColumnHeaderComponent);
