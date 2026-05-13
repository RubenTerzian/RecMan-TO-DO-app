import { memo, useCallback } from "react";
import { useStore } from "@/store/store";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnAddTaskControl } from "@/features/ColumnsGrid/Column/components/ColumnAddTaskControl/ColumnAddTaskControl";
import { ColumnDefaultHeaderArea } from "@/features/ColumnsGrid/Column/components/ColumnDefaultHeaderArea/ColumnDefaultHeaderArea";
import { ColumnSelectionHeader } from "@/features/ColumnsGrid/Column/components/ColumnSelectionHeader/ColumnSelectionHeader";
import { ColumnTaskList } from "@/features/ColumnsGrid/Column/components/ColumnTaskList/ColumnTaskList";
import { useColumnDragAndDropContext } from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { useIsColumnDropTarget } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";

type ColumnProps = {
  columnId: string;
};

function ColumnComponent({ columnId }: ColumnProps) {
  const selectionMode = useStore((state) => state.selectionMode);
  const isDropTarget = useIsColumnDropTarget(columnId);

  const { registerColumnElement, registerColumnDragHandle } =
    useColumnDragAndDropContext();
  const handleColumnRef = useCallback(
    (element: HTMLElement | null) => {
      registerColumnElement(columnId, element);
    },
    [columnId, registerColumnElement],
  );
  const handleDragHandleRef = useCallback(
    (element: HTMLElement | null) => {
      registerColumnDragHandle(columnId, element);
    },
    [columnId, registerColumnDragHandle],
  );

  return (
    <section
      ref={handleColumnRef}
      className={clsx(styles.column, {
        [styles.selectionMode]: selectionMode,
        [styles.taskDropTarget]: isDropTarget,
      })}
      data-testid="column-card"
    >
      {selectionMode ? (
        <ColumnSelectionHeader columnId={columnId} />
      ) : (
        <ColumnDefaultHeaderArea
          columnId={columnId}
          dragHandleRef={handleDragHandleRef}
        />
      )}

      {!selectionMode ? <ColumnAddTaskControl columnId={columnId} /> : null}

      <div className={styles.taskViewport}>
        <ColumnTaskList columnId={columnId} selectionMode={selectionMode} />
      </div>
    </section>
  );
}

export const Column = memo(ColumnComponent);
