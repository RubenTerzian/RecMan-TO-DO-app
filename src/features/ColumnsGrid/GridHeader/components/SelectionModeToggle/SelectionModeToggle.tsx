import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { clsx } from "@/utils/clsx";
import styles from "./SelectionModeToggle.module.css";

type SelectionModeToggleProps = {
  enabled: boolean;
  className?: ButtonHTMLAttributes<HTMLButtonElement>["className"];
  onToggle(): void;
};

export function SelectionModeToggle({
  className,
  enabled,
  onToggle,
}: SelectionModeToggleProps) {
  return (
    <Button
      className={clsx(styles.selectionModeToggle, className)}
      data-testid="selection-mode-toggle"
      data-enabled={enabled}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {enabled ? "Exit selection mode" : "Enter selection mode"}
    </Button>
  );
}
