import type { ButtonHTMLAttributes } from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { clsx } from "@/utils/clsx";
import styles from "./SelectionModeToggle.module.css";

type SelectionModeToggleProps = {
  enabled: boolean;
  className?: ButtonHTMLAttributes<HTMLButtonElement>["className"];
  onToggle(): void;
};

function SelectionModeToggleComponent({
  className,
  enabled,
  onToggle,
}: SelectionModeToggleProps) {
  return (
    <Button
      variant="secondary"
      className={clsx(styles.selectionModeToggle, className)}
      data-enabled={enabled}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {enabled ? "Exit selection mode" : "Enter selection mode"}
    </Button>
  );
}

export const SelectionModeToggle = memo(SelectionModeToggleComponent);
