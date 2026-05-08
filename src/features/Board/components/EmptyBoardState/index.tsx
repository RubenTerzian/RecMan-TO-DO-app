import { CreateColumnButton } from "@/components/shared/CreateColumnButton";
import styles from "./EmptyBoardState.module.css";

export function EmptyBoardState() {
  return (
    <div className={styles.emptyBoardState} data-testid="empty-board-state">
      <p className={styles.kicker}>Guided start</p>
      <h2 className={styles.title}>Create the first column</h2>
      <p className={styles.description}>
        Start with one empty column, then add tasks and move between mock states
        to review the layout.
      </p>
      <CreateColumnButton
        label="Create your first column"
      />
    </div>
  );
}
