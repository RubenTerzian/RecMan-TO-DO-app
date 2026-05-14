import emptyBoardIllustration from "@/assets/pulp-fiction-john-travolta.gif";
import styles from "./EmptyBoardState.module.css";

export function EmptyBoardState() {
  return (
    <section className={styles.emptyBoardState} data-empty-board="true">
      <img
        className={styles.gif}
        src={emptyBoardIllustration}
        alt="Animated empty board illustration"
      />

      <div className={styles.copy}>
        <span className={styles.badge}>All columns cleared</span>
        <h2 className={styles.title}>Your board is officially spotless!</h2>
        <p className={styles.description}>
          Add a fresh column and let the productive chaos roll back in.
        </p>
      </div>
    </section>
  );
}
