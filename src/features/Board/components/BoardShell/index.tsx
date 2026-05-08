import { clsx } from "@/utils/clsx";
import { Button } from "@/components/atoms/Button/index";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import type { MockBoardState } from "../../../../app/mockScreens";
import styles from "./BoardShell.module.css";
import { BoardCanvas } from "@/features/Board/components/BoardCanvas/index";
import { Column } from "@/features/Column/components/Column/index";
import { EmptyBoardState } from "@/features/Board/components/EmptyBoardState/index";
import { NoResultsState } from "@/features/Board/components/NoResultsState/index";

type BoardShellProps = {
  board: MockBoardState;
};

export function BoardShell({ board }: BoardShellProps) {
  const { createColumn } = useColumnActions();

  return (
    <main className={styles.boardShell}>
      <BoardCanvas>
        {board.variant === "empty" ? <EmptyBoardState /> : null}

        {board.variant === "no-results" && board.noResults ? (
          <NoResultsState
            description={board.noResults.description}
            filter={board.noResults.filter}
            searchTerm={board.noResults.searchTerm}
            title={board.noResults.title}
          />
        ) : null}

        {board.variant === "board" ? (
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
                  emptyMessage={column.emptyMessage}
                />
              ))}

              {!board.selectionMode ? (
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
                  <Button
                    className={styles.createColumnButton}
                    data-testid="create-column-button"
                    onClick={createColumn}
                  >
                    New column
                  </Button>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}
      </BoardCanvas>
    </main>
  );
}
