import { Column } from "@/features/ColumnsGrid/Column/Column";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { EmptyBoardState } from "@/features/ColumnsGrid/components/EmptyBoardState/EmptyBoardState";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";
import { useColumnDragAndDrop } from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { TaskDragAndDropProvider } from "@/features/ColumnsGrid/Task/components/TaskDragAndDropProvider/TaskDragAndDropProvider";
import { useTaskDragAndDrop } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import { selectBoardGridState } from "../../store/selectors";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import columnStyles from "@/features/ColumnsGrid/Column/Column.module.css";
import styles from "./ColumnsGrid.module.css";

export function ColumnsGrid() {
  const { columns, selectionMode } = useStore(useShallow(selectBoardGridState));
  const isBoardEmpty = columns.length === 0;

  const { boardViewportRef, setColumnDragHandle, setColumnElement } =
    useColumnDragAndDrop({ columns, selectionMode });
  const taskDragAndDrop = useTaskDragAndDrop({
    boardViewportRef,
    selectionMode,
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

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <GridHeader
            isCreateColumnDisabled={isCreatingColumn}
            onCreateColumn={handleStartColumnCreation}
          />

          <div ref={boardViewportRef} className={styles.boardViewport}>
            <div className={styles.mobileScrollHint} aria-hidden="true">
              Swipe to see more columns →
            </div>

            <TaskDragAndDropProvider value={taskDragAndDrop}>
              {isBoardEmpty && !isCreatingColumn ? (
                <EmptyBoardState />
              ) : (
                <div
                  className={styles.boardGrid}
                  data-testid="board-column-track"
                  data-column-track="true"
                >
                  {columns.map((column) => (
                    <Column
                      key={column.id}
                      columnId={column.id}
                      columnRef={(element) => {
                        setColumnElement(column.id, element);
                      }}
                      dragHandleRef={(element) => {
                        setColumnDragHandle(column.id, element);
                      }}
                      title={column.title}
                      selectionMode={selectionMode}
                    />
                  ))}

                  {isCreatingColumn ? (
                    <section
                      className={columnStyles.column}
                      data-testid="create-column-card"
                    >
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
                  ) : null}
                </div>
              )}
            </TaskDragAndDropProvider>
          </div>
        </div>
      </section>
    </main>
  );
}
