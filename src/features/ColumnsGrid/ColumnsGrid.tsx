import type { FocusEvent } from "react";
import { Column } from "@/features/ColumnsGrid/Column/Column";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";
import { selectBoardGridState } from "../../store/selectors";
import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";
import columnStyles from "@/features/ColumnsGrid/Column/Column.module.css";
import styles from "./ColumnsGrid.module.css";

export function ColumnsGrid() {
  const { columns, selectionMode } = useStore(useShallow(selectBoardGridState));
  const {
    draftTitle,
    isCreatingColumn,
    handleDraftTitleChange,
    handleCancelColumnCreation,
    handleSaveColumnCreation,
    handleStartColumnCreation,
  } = useColumnCreation();

  const handleCreateEditorBlur = (event: FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    handleCancelColumnCreation();
  };

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <GridHeader
            isCreateColumnDisabled={isCreatingColumn}
            onCreateColumn={handleStartColumnCreation}
          />

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
          </div>
        </div>
      </section>
    </main>
  );
}
