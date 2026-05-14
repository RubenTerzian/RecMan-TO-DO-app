import { BoardSurface } from "@/features/ColumnsGrid/components/BoardSurface/BoardSurface";
import { ColumnDragGhost } from "@/features/ColumnsGrid/components/ColumnDragGhost/ColumnDragGhost";
import { ColumnCreationProvider } from "@/features/ColumnsGrid/context/ColumnCreationContext";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import {
  ColumnDragAndDropContext,
  useColumnDragAndDrop,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { TaskDragAndDropProvider } from "@/features/ColumnsGrid/Task/components/TaskDragAndDropProvider/TaskDragAndDropProvider";
import { TaskDragGhost } from "@/features/ColumnsGrid/Task/components/TaskDragGhost/TaskDragGhost";
import { useTaskDragAndDrop } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import styles from "./ColumnsGrid.module.css";

export function ColumnsGrid() {
  const columnIds = useStore(
    useShallow((state) => state.columns.map((column) => column.id)),
  );
  const isBoardEmpty = columnIds.length === 0;

  const { boardViewportRef, contextValue: columnDragContextValue } =
    useColumnDragAndDrop();
  const taskDragAndDrop = useTaskDragAndDrop({
    boardViewportRef,
  });

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas}>
        {/*
         * The column-creation provider wraps both the trigger
         * (`AddColumnButton` inside `GridHeader`) and the trailing
         * editor (inside `BoardSurface`) so they share the gate without
         * any common ancestor subscribing to it. `ColumnsGrid` and
         * `GridHeader` never re-render on open / close / commit.
         */}
        <ColumnCreationProvider>
          <div className={styles.boardContent}>
            <GridHeader hasColumns={!isBoardEmpty} />

            <div ref={boardViewportRef} className={styles.boardViewport}>
              <div className={styles.mobileScrollHint} aria-hidden="true">
                Swipe to see more columns →
              </div>

              <ColumnDragAndDropContext.Provider value={columnDragContextValue}>
                <TaskDragAndDropProvider value={taskDragAndDrop}>
                  <BoardSurface
                    boardViewportRef={boardViewportRef}
                    className={styles.boardGrid}
                    columnIds={columnIds}
                  />
                </TaskDragAndDropProvider>
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
