import styles from "./SelectionModeToggle.module.css";
import { Button } from "@/components/atoms/Button/index";

type SelectionModeToggleProps = {
  enabled: boolean;
};

export function SelectionModeToggle({ enabled }: SelectionModeToggleProps) {
  return (
    <Button
      className={styles.selectionModeToggle}
      data-testid="selection-mode-toggle"
      aria-pressed={enabled}
    >
      {enabled ? "Exit selection mode" : "Enter selection mode"}
    </Button>
  );
}
