import { IconButton } from "@/components/atoms/IconButton";
import styles from "./ColumnActions.module.css";

type ColumnActionsProps = {
  status: string;
  meta: string;
  onDelete?: () => void;
  onEdit?: () => void;
};

export function ColumnActions({
  status,
  meta,
  onDelete,
  onEdit,
}: ColumnActionsProps) {
  return (
    <div className={styles.columnActions}>
      <span className={styles.status}>{status}</span>
      <span className={styles.meta}>{meta}</span>

      <div className={styles.actionButtons}>
        <IconButton
          aria-label="Edit column"
          className={styles.actionButton}
          data-testid="edit-column-button"
          onClick={onEdit}
        >
          Edit
        </IconButton>

        <IconButton
          aria-label="Delete column"
          className={styles.actionButtonDanger}
          data-testid="delete-column-button"
          onClick={onDelete}
        >
          Delete
        </IconButton>
      </div>
    </div>
  );
}
