import { CreateColumnButton } from "@/components/shared/CreateColumnButton/CreateColumnButton";
import { Column } from "@/features/ColumnsGrid/Column/Column";
import { useColumnsGridData } from "@/hooks/useColumnsGridData";
import styles from "./ColumnsGrid.module.css";

export function ColumnsGrid() {
  const {
    columns,
    selectionMode,
    onTaskSelectionToggle,
    onColumnTaskSelectionToggle,
    onTaskCompletionToggle,
  } = useColumnsGridData();

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <div className={styles.boardViewport}>
            <div className={styles.mobileScrollHint} aria-hidden="true">
              Swipe to see more columns →
            </div>

            <div className={styles.boardGrid} data-testid="board-grid">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  selectionMode={selectionMode}
                  onToggleTaskCompletion={onTaskCompletionToggle}
                  onToggleTaskSelection={onTaskSelectionToggle}
                  onToggleColumnTaskSelection={onColumnTaskSelectionToggle}
                />
              ))}

              {!selectionMode ? (
                <section
                  className={styles.createColumnCard}
                  data-testid="create-column-card"
                >
                  <p className={styles.createColumnEyebrow}>Board actions</p>
                  <h2 className={styles.createColumnTitle}>
                    Create new column
                  </h2>
                  <p className={styles.createColumnDescription}>
                    Add another lane to the board for new work, handoffs, or
                    done items.
                  </p>
                  <CreateColumnButton
                    className={styles.createColumnButton}
                    data-testid="create-column-button"
                  />
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
