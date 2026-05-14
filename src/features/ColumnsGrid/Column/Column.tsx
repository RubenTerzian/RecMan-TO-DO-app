import { memo, useCallback } from "react";
import { useStore } from "@/store/store";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnDefaultHeaderArea } from "@/features/ColumnsGrid/Column/components/ColumnDefaultHeaderArea/ColumnDefaultHeaderArea";
import { ColumnSelectionHeader } from "@/features/ColumnsGrid/Column/components/ColumnSelectionHeader/ColumnSelectionHeader";
import { ColumnTaskList } from "@/features/ColumnsGrid/Column/components/ColumnTaskList/ColumnTaskList";
import { TaskCreationSlot } from "@/features/ColumnsGrid/Column/components/TaskCreationSlot/TaskCreationSlot";
import { TaskCreationProvider } from "@/features/ColumnsGrid/Column/context/TaskCreationProvider";
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
    /*
     * The task-creation provider wraps both the trigger
     * (`AddTaskButton` inside `ColumnHeader`) and the editor slot
     * (`TaskCreationSlot`). `Column`, `ColumnHeader`, and
     * `ColumnTaskList` never subscribe to the gate, so they don't
     * re-render when the editor opens, closes, or commits.
     */
    <TaskCreationProvider columnId={columnId}>
      <section
        ref={handleColumnRef}
        className={clsx(styles.column, {
          [styles.selectionMode]: selectionMode,
          [styles.taskDropTarget]: isDropTarget,
        })}
      >
        {selectionMode ? (
          <ColumnSelectionHeader columnId={columnId} />
        ) : (
          <ColumnDefaultHeaderArea
            columnId={columnId}
            dragHandleRef={handleDragHandleRef}
          />
        )}

        {!selectionMode ? <TaskCreationSlot /> : null}

        <div className={styles.taskViewport}>
          <ColumnTaskList columnId={columnId} />
        </div>
      </section>
    </TaskCreationProvider>
  );
}

export const Column = memo(ColumnComponent);
