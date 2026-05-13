import { memo } from "react";
import styles from "./ColumnDropPlaceholder.module.css";

type ColumnDropPlaceholderProps = {
  width: number;
  height: number;
};

function ColumnDropPlaceholderComponent({
  width,
  height,
}: ColumnDropPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.placeholder}
      data-testid="column-drop-placeholder"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export const ColumnDropPlaceholder = memo(ColumnDropPlaceholderComponent);
