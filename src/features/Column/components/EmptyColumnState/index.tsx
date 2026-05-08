import styles from "./EmptyColumnState.module.css";

type EmptyColumnStateProps = {
  message?: string;
  testId?: string;
};

export function EmptyColumnState({
  message = "Empty column",
  testId,
}: EmptyColumnStateProps) {
  return <div className={styles.emptyColumnState} data-testid={testId}>{message}</div>;
}
