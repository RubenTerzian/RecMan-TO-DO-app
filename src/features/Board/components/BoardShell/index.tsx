import { clsx } from "@/utils/clsx";
import type { MockBoardState } from "@/app/mockScreens";
import styles from "./BoardShell.module.css";
import { BoardCanvas } from "@/features/Board/components/BoardCanvas/index";
import { Column } from "@/features/Column/components/Column/index";
import { EmptyBoardState } from "@/features/Board/components/EmptyBoardState/index";
import { NoResultsState } from "@/features/Board/components/NoResultsState/index";

type BoardShellProps = {
  board: MockBoardState;
};

export function BoardShell({ board }: BoardShellProps) {
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
          <div
            className={clsx(styles.boardGrid, {
              [styles.mobileBoardGrid]: board.columns?.some((column) => column.showMobileReorderMenu),
            })}
            data-testid="board-grid"
          >
            {board.columns?.map((column) => (
              <Column
                key={column.id}
                title={column.title}
                subtitle={column.subtitle}
                taskCount={column.tasks.length}
                status={column.status}
                meta={column.meta}
                tasks={column.tasks}
                selectionMode={board.selectionMode}
                showMobileReorderMenu={column.showMobileReorderMenu}
                emptyMessage={column.emptyMessage}
              />
            ))}
          </div>
        ) : null}
      </BoardCanvas>
    </main>
  );
}
