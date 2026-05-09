import type { Ref } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import { TaskDragPreview } from "@/features/ColumnsGrid/Task/components/TaskDragPreview/TaskDragPreview";
import styles from "./EmptyColumnState.module.css";

type EmptyColumnStateProps = {
  containerRef?: Ref<HTMLDivElement>;
  isDropActive?: boolean;
  variant?: "empty" | "no-results";
  title?: string;
  message?: string;
  previewTitle?: string;
  testId?: string;
};

function EmptyColumnStateComponent({
  containerRef,
  isDropActive = false,
  variant = "empty",
  title,
  message,
  previewTitle,
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
        [styles.dropActive]: isDropActive,
        [styles.noResultsState]: variant === "no-results",
      })}
      data-testid={testId}
    >
      {previewTitle ? (
        <TaskDragPreview title={previewTitle} />
      ) : (
        <>
          <h4 className={styles.title}>{resolvedTitle}</h4>
          <p className={styles.message}>{resolvedMessage}</p>
        </>
      )}
    </div>
  );
}

export const EmptyColumnState = memo(EmptyColumnStateComponent);
