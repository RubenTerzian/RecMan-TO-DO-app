import { clsx } from "@/utils/clsx";
import styles from "./SelectionActionBar.module.css";
import { MoveSelectionControl } from "./MoveSelectionControl";
import { SelectionCountPill } from "./SelectionCountPill";
import { SelectionMutationButtons } from "./SelectionMutationButtons";
import { SelectionToggleButton } from "./SelectionSelectAllButton";

type SelectionActionBarProps = {
  className?: string;
};

export function SelectionActionBar({ className }: SelectionActionBarProps) {
  return (
    <section className={clsx(styles.selectionActionBar, className)}>
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.title}>Bulk update</h3>
          <p className={styles.caption}>Apply changes to the selected tasks.</p>
        </div>
        <div className={styles.selectionContainer}>
          <SelectionToggleButton />
          <SelectionCountPill />
        </div>
      </div>

      <div className={styles.content}>
        <SelectionMutationButtons />
        <MoveSelectionControl />
      </div>
    </section>
  );
}
