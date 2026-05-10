import { memo } from "react";
import styles from "./ClearAllButton.module.css";
import { Button } from "@/components/atoms/Button/Button";
import { useClearAllControl } from "@/features/TopBar/hooks/useClearAllControl";

function ClearAllButtonComponent() {
  const { hasActiveTaskFilters, handleClearAll } = useClearAllControl();

  if (!hasActiveTaskFilters) {
    return null;
  }

  return (
    <Button className={styles.clearAllButton} onClick={handleClearAll}>
      Clear all
    </Button>
  );
}

export const ClearAllButton = memo(ClearAllButtonComponent);
