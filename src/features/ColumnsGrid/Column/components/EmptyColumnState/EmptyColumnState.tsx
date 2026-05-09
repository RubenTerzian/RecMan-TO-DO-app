import { clsx } from "@/utils/clsx";
import styles from "./EmptyColumnState.module.css";

type EmptyColumnStateProps = {
  variant?: "empty" | "no-results";
  title?: string;
  message?: string;
  testId?: string;
};

export function EmptyColumnState({
  variant = "empty",
  title,
  message,
  testId,
}: EmptyColumnStateProps) {
  const resolvedTitle =
    title ?? (variant === "no-results" ? "No matching tasks" : "Empty column");
  const resolvedMessage =
    message ??
    (variant === "no-results"
      ? "Try another search term or clear the filter to show tasks here."
      : "No tasks yet.");

  return (
    <div
      className={clsx(styles.emptyColumnState, {
        [styles.noResultsState]: variant === "no-results",
      })}
      data-testid={testId}
    >
      <h4 className={styles.title}>{resolvedTitle}</h4>
      <p className={styles.message}>{resolvedMessage}</p>
    </div>
  );
}
