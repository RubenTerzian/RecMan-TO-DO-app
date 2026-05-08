import styles from "./ColumnActions.module.css";

type ColumnActionsProps = {
  status: string;
  meta: string;
};

export function ColumnActions({ status, meta }: ColumnActionsProps) {
  return (
    <div className={styles.columnActions}>
      <span className={styles.status}>{status}</span>
      <span className={styles.meta}>{meta}</span>
    </div>
  );
}
