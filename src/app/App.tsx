import { useEffect } from "react";
import styles from "./AppShell.module.css";
import { TopBar } from "@/features/TopBar/TopBar";
import { ColumnsGrid } from "@/features/ColumnsGrid/ColumnsGrid";
import { useStore } from "@/store/store";
import { saveStoredState } from "@/store/persistence";

function flushStoreToStorage() {
  const { columns, tasks } = useStore.getState();
  saveStoredState({ columns, tasks });
}

export default function App() {
  useEffect(() => {
    window.addEventListener("beforeunload", flushStoreToStorage);
    window.addEventListener("pagehide", flushStoreToStorage);

    return () => {
      flushStoreToStorage();
      window.removeEventListener("beforeunload", flushStoreToStorage);
      window.removeEventListener("pagehide", flushStoreToStorage);
    };
  }, []);

  return (
    <div className={styles.appShell}>
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
