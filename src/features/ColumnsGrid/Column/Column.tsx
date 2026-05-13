import { memo, useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import styles from "./Column.module.css";
import { clsx } from "@/utils/clsx";
import { ColumnAddTaskControl } from "@/features/ColumnsGrid/Column/components/ColumnAddTaskControl/ColumnAddTaskControl";
import { ColumnDefaultHeaderArea } from "@/features/ColumnsGrid/Column/components/ColumnDefaultHeaderArea/ColumnDefaultHeaderArea";
import { ColumnSelectionHeader } from "@/features/ColumnsGrid/Column/components/ColumnSelectionHeader/ColumnSelectionHeader";
import { ColumnTaskList } from "@/features/ColumnsGrid/Column/components/ColumnTaskList/ColumnTaskList";
import {
  useColumnDragAndDropContext,
  useColumnDropIndicatorEdge,
  useIsColumnDragging,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import { makeSelectColumnTitle } from "@/store/selectors";

type ColumnProps = {
  columnId: string;
};

function ColumnComponent({ columnId }: ColumnProps) {
  const selectTitle = useMemo(
    () => makeSelectColumnTitle(columnId),
    [columnId],
  );
  const title = useStore(selectTitle);
  const selectionMode = useStore((state) => state.selectionMode);

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

  const dropIndicatorEdge = useColumnDropIndicatorEdge(columnId);
  const isDragging = useIsColumnDragging(columnId);

  return (
    <section
      ref={handleColumnRef}
      className={clsx(styles.column, { [styles.selectionMode]: selectionMode })}
      data-dragging={isDragging || undefined}
      data-testid="column-card"
    >
      {dropIndicatorEdge ? (
        <span
          className={clsx(styles.dropIndicator, {
            [styles.dropIndicatorLeft]: dropIndicatorEdge === "left",
            [styles.dropIndicatorRight]: dropIndicatorEdge === "right",
          })}
          data-testid="column-drop-indicator"
        />
      ) : null}

      {selectionMode ? (
        <ColumnSelectionHeader columnId={columnId} title={title} />
      ) : (
        <ColumnDefaultHeaderArea
          columnId={columnId}
          dragHandleRef={handleDragHandleRef}
          title={title}
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
