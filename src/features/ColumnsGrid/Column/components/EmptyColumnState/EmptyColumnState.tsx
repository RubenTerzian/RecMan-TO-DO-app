import type { Ref } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./EmptyColumnState.module.css";

type EmptyColumnStateProps = {
  containerRef?: Ref<HTMLDivElement>;
  variant?: "empty" | "no-results";
  title?: string;
  message?: string;
  testId?: string;
};

function EmptyColumnStateComponent({
  containerRef,
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
      ref={containerRef}
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

export const EmptyColumnState = memo(EmptyColumnStateComponent);
