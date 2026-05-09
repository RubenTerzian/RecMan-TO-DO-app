import styles from "./AppShell.module.css";
import { TopBar } from "@/features/TopBar";
import { ColumnsGrid } from "@/features/ColumnsGrid";

export default function App() {
  return (
    <div className={styles.appShell} data-testid="app-shell">
      <div className={styles.appFrame}>
        <TopBar />
        <ColumnsGrid />
      </div>
    </div>
  );
}
