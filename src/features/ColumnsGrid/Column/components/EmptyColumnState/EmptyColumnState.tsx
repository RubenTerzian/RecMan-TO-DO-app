import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./EmptyColumnState.module.css";

type EmptyColumnStateProps = {
  variant: "empty" | "no-results";
  title: string;
  message: string;
};

function EmptyColumnStateComponent({
  variant,
  title,
  message,
}: EmptyColumnStateProps) {
  return (
    <div
      className={clsx(styles.emptyColumnState, {
        [styles.noResultsState]: variant === "no-results",
      })}
    >
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export const EmptyColumnState = memo(EmptyColumnStateComponent);
