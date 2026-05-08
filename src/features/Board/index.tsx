import { CreateColumnButton } from "@/components/shared/CreateColumnButton";
import { clsx } from "@/utils/clsx";
import type { MockBoardState } from "@/app/mockScreens";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import { Column } from "@/features/Column";
import { EmptyBoardState } from "@/features/Board/components/EmptyBoardState";
import styles from "./Board.module.css";

type BoardProps = {
  board: MockBoardState;
};

export function Board({ board }: BoardProps) {
  const { createColumn } = useColumnActions();

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          {board.variant === "empty" ? <EmptyBoardState /> : null}

          {board.variant !== "empty" ? (
            <div className={styles.boardViewport}>
              <div className={styles.mobileScrollHint} aria-hidden="true">
                Swipe to see more columns →
              </div>

              <div
                className={clsx(styles.boardGrid, {
                  [styles.mobileBoardGrid]: board.columns?.some(
                    (column) => column.showMobileReorderMenu,
                  ),
                })}
                data-testid="board-grid"
              >
                {board.columns?.map((column) => (
                  <Column
                    key={column.id}
                    title={column.title}
                    subtitle={column.subtitle}
                    tasks={column.tasks}
                    selectionMode={board.selectionMode}
                    showMobileReorderMenu={column.showMobileReorderMenu}
                    emptyState={column.emptyState}
                    editorMode={column.editorMode}
                    draftTitle={column.draftTitle}
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
                      onClick={createColumn}
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
