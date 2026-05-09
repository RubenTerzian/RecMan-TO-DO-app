import { Column } from "@/features/ColumnsGrid/Column/Column";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import styles from "./ColumnsGrid.module.css";

export function ColumnsGrid() {
  const { columns, selectionMode } = useStore(
    useShallow((state) => ({
      columns: state.columns,
      selectionMode: state.selectionMode,
    })),
  );

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <GridHeader />

          <div className={styles.boardViewport}>
            <div className={styles.mobileScrollHint} aria-hidden="true">
              Swipe to see more columns →
            </div>

            <div className={styles.boardGrid} data-testid="board-grid">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  columnId={column.id}
                  title={column.title}
                  selectionMode={selectionMode}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
