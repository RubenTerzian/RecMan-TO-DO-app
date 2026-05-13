import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { ColumnDragGhost } from "@/features/ColumnsGrid/components/ColumnDragGhost/ColumnDragGhost";
import { ColumnTrack } from "@/features/ColumnsGrid/components/ColumnTrack/ColumnTrack";
import { EmptyBoardState } from "@/features/ColumnsGrid/components/EmptyBoardState/EmptyBoardState";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";
import {
  ColumnDragAndDropContext,
  useColumnDragAndDrop,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { TaskDragAndDropProvider } from "@/features/ColumnsGrid/Task/components/TaskDragAndDropProvider/TaskDragAndDropProvider";
import { TaskDragGhost } from "@/features/ColumnsGrid/Task/components/TaskDragGhost/TaskDragGhost";
import { useTaskDragAndDrop } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import columnStyles from "@/features/ColumnsGrid/Column/Column.module.css";
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

  const {
    draftTitle,
    isCreatingColumn,
    handleCreateEditorBlur,
    handleDraftTitleChange,
    handleCancelColumnCreation,
    handleSaveColumnCreation,
    handleStartColumnCreation,
  } = useColumnCreation();

  const createColumnEditor = isCreatingColumn ? (
    <section className={columnStyles.column} data-testid="create-column-card">
      <ColumnEditor
        autoFocus
        draftTitle={draftTitle}
        mode="create"
        onBlur={handleCreateEditorBlur}
        onCancel={handleCancelColumnCreation}
        onDraftTitleChange={handleDraftTitleChange}
        onSave={handleSaveColumnCreation}
      />
    </section>
  ) : null;

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <GridHeader
            hasColumns={!isBoardEmpty}
            isCreateColumnDisabled={isCreatingColumn}
            onCreateColumn={handleStartColumnCreation}
          />

          <div ref={boardViewportRef} className={styles.boardViewport}>
            <div className={styles.mobileScrollHint} aria-hidden="true">
              Swipe to see more columns →
            </div>

            <ColumnDragAndDropContext.Provider value={columnDragContextValue}>
              <TaskDragAndDropProvider value={taskDragAndDrop}>
                {isBoardEmpty && !isCreatingColumn ? (
                  <EmptyBoardState />
                ) : (
                  <ColumnTrack
                    className={styles.boardGrid}
                    columnIds={columnIds}
                    trailing={createColumnEditor}
                  />
                )}
              </TaskDragAndDropProvider>
            </ColumnDragAndDropContext.Provider>
          </div>
        </div>
      </section>
      <ColumnDragGhost />
      <TaskDragGhost />
    </main>
  );
}
