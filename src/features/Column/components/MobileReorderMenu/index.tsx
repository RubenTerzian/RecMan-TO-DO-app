import styles from "./MobileReorderMenu.module.css";

export function MobileReorderMenu() {
  return (
    <div className={styles.mobileReorderMenu} data-testid="mobile-reorder-menu">
      <span className={styles.label}>Mobile reorder</span>
      <button type="button">Move left</button>
      <button type="button">Move right</button>
    </div>
  );
}
