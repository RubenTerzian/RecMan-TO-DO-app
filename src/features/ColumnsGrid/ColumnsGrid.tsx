import { useMemo } from "react";
import { Column } from "@/features/ColumnsGrid/Column/Column";
import { GridHeader } from "@/features/ColumnsGrid/GridHeader/GridHeader";
import { useStore } from "@/store/store";
import styles from "./ColumnsGrid.module.css";

function groupTasksByColumnId(
  tasks: ReturnType<typeof useStore.getState>["tasks"],
) {
  return tasks.reduce<Record<string, typeof tasks>>((groups, task) => {
    const tasksForColumn = groups[task.columnId] ?? [];

    return {
      ...groups,
      [task.columnId]: [...tasksForColumn, task],
    };
  }, {});
}

export function ColumnsGrid() {
  const {
    columns,
    tasks,
    selectionMode,
    toggleTaskSelection,
    toggleColumnTaskSelection,
    toggleTaskCompletion,
  } = useStore();

  const tasksByColumnId = useMemo(() => groupTasksByColumnId(tasks), [tasks]);

  return (
    <main className={styles.board}>
      <section className={styles.boardCanvas} data-testid="board-canvas">
        <div className={styles.boardContent}>
          <GridHeader />

          <div className={styles.boardViewport}>
            <div className={styles.mobileScrollHint} aria-hidden="true">
              Swipe to see more columns →
            </div>

            <div className={styles.boardGrid} data-testid="board-grid">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  title={column.title}
                  tasks={tasksByColumnId[column.id] ?? []}
                  selectionMode={selectionMode}
                  onToggleTaskCompletion={toggleTaskCompletion}
                  onToggleTaskSelection={toggleTaskSelection}
                  onToggleColumnTaskSelection={toggleColumnTaskSelection}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
