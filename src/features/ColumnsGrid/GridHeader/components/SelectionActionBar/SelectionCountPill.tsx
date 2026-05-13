import { memo } from "react";
import { useStore } from "@/store/store";
import styles from "./SelectionActionBar.module.css";

function SelectionCountPillComponent() {
  const selectionCount = useStore((state) => state.selectedTaskIds.length);

  return (
    <span className={styles.selectionPill}>{selectionCount} selected</span>
  );
}

export const SelectionCountPill = memo(SelectionCountPillComponent);
