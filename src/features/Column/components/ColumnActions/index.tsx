import { IconButton } from "@/components/atoms/IconButton/index";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import styles from "./ColumnActions.module.css";

type ColumnActionsProps = {
  status: string;
  meta: string;
};

export function ColumnActions({ status, meta }: ColumnActionsProps) {
  const { renameColumn, deleteColumn } = useColumnActions();

  return (
    <div className={styles.columnActions}>
      <span className={styles.status}>{status}</span>
      <span className={styles.meta}>{meta}</span>

      <div className={styles.actionButtons}>
        <IconButton
          aria-label="Edit column"
          className={styles.actionButton}
          data-testid="edit-column-button"
          onClick={renameColumn}
        >
          Edit
        </IconButton>

        <IconButton
          aria-label="Delete column"
          className={styles.actionButtonDanger}
          data-testid="delete-column-button"
          onClick={deleteColumn}
        >
          Delete
        </IconButton>
      </div>
    </div>
  );
}
