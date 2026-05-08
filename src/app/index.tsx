import styles from "./AppShell.module.css";
import { TopBar } from "@/features/TopBar";
import { Board } from "@/features/Board";

export default function App() {
  return (
    <div className={styles.appShell} data-testid="app-shell">
      <div className={styles.appFrame}>
        <TopBar />
        <Board />
      </div>
    </div>
  );
}
