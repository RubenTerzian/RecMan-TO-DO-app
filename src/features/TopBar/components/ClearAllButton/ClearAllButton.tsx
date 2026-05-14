import { memo } from "react";
import styles from "./ClearAllButton.module.css";
import { Button } from "@/components/atoms/Button/Button";
import {
  selectHasActiveTaskFilters,
  selectResetTaskFilters,
} from "@/store/selectors";
import { useStore } from "@/store/store";

function ClearAllButtonComponent() {
  const hasActiveTaskFilters = useStore(selectHasActiveTaskFilters);
  const resetTaskFilters = useStore(selectResetTaskFilters);

  if (!hasActiveTaskFilters) {
    return null;
  }

  return (
    <Button className={styles.clearAllButton} onClick={resetTaskFilters}>
      Clear all
    </Button>
  );
}

export const ClearAllButton = memo(ClearAllButtonComponent);
