import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import deleteIcon from "@/assets/icons/delete.svg";
import editIcon from "@/assets/icons/edit.svg";
import { IconButton } from "@/components/atoms/IconButton";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  title: string;
  selectionMode?: boolean;
};

export function ColumnHeader({
  title,
  selectionMode = false,
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
          <IconButton
            className={styles.iconAction}
            data-testid="edit-column-button"
            aria-label="Edit column"
            onClick={renameColumn}
          >
            <img
              src={editIcon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
          </IconButton>

          <IconButton
            className={styles.iconAction}
            data-testid="delete-column-button"
            aria-label="Delete column"
            onClick={deleteColumn}
          >
            <img
              src={deleteIcon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
          </IconButton>
        </div>
      ) : null}
    </header>
  );
}
