import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  title: string;
  allSelected?: boolean;
  selectionMode?: boolean;
  showSelectionToggle?: boolean;
};

export function ColumnHeader({
  allSelected = false,
  title,
  selectionMode = false,
  showSelectionToggle = false,
}: ColumnHeaderProps) {
  const { renameColumn, deleteColumn } = useColumnActions();

  return (
    <header
      className={
        selectionMode
          ? styles.columnHeader
          : `${styles.columnHeader} ${styles.draggableHeader}`
      }
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
            onClick={renameColumn}
          />

          <DeleteIconButton
            data-testid="delete-column-button"
            aria-label="Delete column"
            onClick={deleteColumn}
          />
        </div>
      ) : showSelectionToggle ? (
        <button className={styles.selectionToggle} type="button">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      ) : null}
    </header>
  );
}
