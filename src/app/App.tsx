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
        <header className={styles.appHeader}>
          <div className={styles.copy}>
            <h1 className={styles.title}>RecMan TO-DO</h1>
            <p className={styles.subtitle}>
              Where messy hiring notes become neat little wins.
            </p>
          </div>
        </header>
        <TopBar />
        <ColumnsGrid />
      </div>
    </div>
  );
}
