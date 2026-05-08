import styles from "./EmptyBoardState.module.css";
import { Button } from "@/components/atoms/Button/index";

export function EmptyBoardState() {
  return (
    <div className={styles.emptyBoardState} data-testid="empty-board-state">
      <p className={styles.kicker}>Guided start</p>
      <h2 className={styles.title}>Create the first column</h2>
      <p className={styles.description}>
        Start with one empty column, then add tasks and move between mock states to review the layout.
      </p>
      <Button className={styles.cta} data-testid="create-first-column-cta">
        Create first column
      </Button>
    </div>
  );
}
