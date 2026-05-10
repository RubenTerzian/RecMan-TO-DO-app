import styles from "./AppShell.module.css";
import { TopBar } from "@/features/TopBar/TopBar";
import { ColumnsGrid } from "@/features/ColumnsGrid/ColumnsGrid";

export default function App() {
  return (
    <div className={styles.appShell} data-testid="app-shell">
      <div className={styles.appFrame}>
        <header className={styles.hero} aria-label="RecMan board introduction">
          <span className={styles.eyebrow}>RecMan workflow hub</span>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>RecMan TO-DO</h1>
            <p className={styles.heroSubtitle}>
              Tame the chaos, charm the deadlines, and give your future self one
              less dramatic monologue.
            </p>
          </div>
        </header>
        <TopBar />
        <ColumnsGrid />
      </div>
    </div>
  );
}
