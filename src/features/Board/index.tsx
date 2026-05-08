import { CreateColumnButton } from "@/components/shared/CreateColumnButton";
import { clsx } from "@/utils/clsx";
import type { BoardState } from "@/features/Board/types";
import { Column } from "@/features/Column";
import { EmptyBoardState } from "@/features/Board/components/EmptyBoardState";
import styles from "./Board.module.css";

const boardState: BoardState = {
  selectionMode: false,
  showCreateColumnCard: true,
  columns: [
    {
      kind: "display",
      id: "column-todo",
      title: "To do",
      tasks: [],
      emptyState: {
        variant: "empty",
        title: "No tasks yet",
        message: "Add your first task to start filling this column.",
      },
    },
  ],
};

export function Board() {
  const board = boardState;
  const hasColumns = board.columns.length > 0;

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          {!hasColumns ? <EmptyBoardState /> : null}

          {hasColumns ? (
            <div className={styles.boardViewport}>
              <div className={styles.mobileScrollHint} aria-hidden="true">
                Swipe to see more columns →
              </div>

              <div
                className={clsx(styles.boardGrid, {
                  [styles.mobileBoardGrid]: board.columns.some(
                    (column) => column.showMobileReorderMenu,
                  ),
                })}
                data-testid="board-grid"
              >
                {board.columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    selectionMode={board.selectionMode}
                  />
                ))}

                {!board.selectionMode &&
                board.showCreateColumnCard !== false ? (
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
          ) : null}
        </div>
      </section>
    </main>
  );
}
