import styles from "./SelectionModeToggle.module.css";
import { Button } from "@/components/atoms/Button/Button";

type SelectionModeToggleProps = {
  enabled: boolean;
  onToggle(): void;
};

export function SelectionModeToggle({
  enabled,
  onToggle,
}: SelectionModeToggleProps) {
  return (
    <Button
      className={styles.selectionModeToggle}
      data-testid="selection-mode-toggle"
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {enabled ? "Exit selection mode" : "Enter selection mode"}
    </Button>
  );
}
