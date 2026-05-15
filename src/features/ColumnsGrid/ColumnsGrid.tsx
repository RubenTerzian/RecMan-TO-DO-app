import { BoardSurface } from "@/features/ColumnsGrid/components/BoardSurface/BoardSurface";
import { ColumnDragGhost } from "@/features/ColumnsGrid/components/ColumnDragGhost/ColumnDragGhost";
import { ColumnCreationProvider } from "@/features/ColumnsGrid/context/ColumnCreationProvider";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import {
  ColumnDragAndDropContext,
  useColumnDragAndDrop,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { TaskDragGhost } from "@/features/ColumnsGrid/Task/components/TaskDragGhost/TaskDragGhost";
import {
  TaskDragAndDropContext,
  useTaskDragAndDrop,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import styles from "./ColumnsGrid.module.css";

/**
 * Static layout for the board. Intentionally has zero store
 * subscriptions — `GridHeader` and `BoardSurface` own their own
 * narrow subscriptions, so column reorder / create / delete and
 * selection-mode toggles never re-render this component or the
 * surrounding DnD provider chain.
 *
 * `useColumnDragAndDrop` and `useTaskDragAndDrop` themselves do
 * not subscribe via React state — they install pointer listeners
 * imperatively and expose stable context values via `useMemo`.
 */
export function ColumnsGrid() {
  const { boardViewportRef, contextValue: columnDragContextValue } =
    useColumnDragAndDrop();
  const taskDragAndDrop = useTaskDragAndDrop({ boardViewportRef });

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas}>
        {/*
         * The column-creation provider wraps both the trigger
         * (`AddColumnButton` inside `GridHeader`) and the trailing
         * editor (inside `BoardSurface`) so they share the gate
         * without any common ancestor subscribing to it.
         */}
        <ColumnCreationProvider>
          <div className={styles.boardContent}>
            <GridHeader />

            <div ref={boardViewportRef} className={styles.boardViewport}>
              <div className={styles.mobileScrollHint} aria-hidden="true">
                Swipe to see more columns →
              </div>

              <ColumnDragAndDropContext.Provider value={columnDragContextValue}>
                <TaskDragAndDropContext.Provider value={taskDragAndDrop}>
                  <BoardSurface
                    boardViewportRef={boardViewportRef}
                    className={styles.boardGrid}
                  />
                </TaskDragAndDropContext.Provider>
              </ColumnDragAndDropContext.Provider>
            </div>
          </div>
        </ColumnCreationProvider>
      </section>
      <ColumnDragGhost />
      <TaskDragGhost />
    </main>
  );
}
