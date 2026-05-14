import { Fragment, memo, useCallback, useMemo } from "react";
import { Column } from "@/features/ColumnsGrid/Column/Column";
import { ColumnDropPlaceholder } from "@/features/ColumnsGrid/components/ColumnDropPlaceholder/ColumnDropPlaceholder";
import {
  useColumnDragAndDropContext,
  useColumnDropPlacement,
  useDraggingColumnId,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";

type ColumnTrackProps = {
  className: string;
  columnIds: string[];
  trailing?: React.ReactNode;
};

function ColumnTrackComponent({
  className,
  columnIds,
  trailing,
}: ColumnTrackProps) {
  const { registerColumnTrack } = useColumnDragAndDropContext();
  const draggingColumnId = useDraggingColumnId();
  const placement = useColumnDropPlacement();

  const visibleColumnIds = useMemo(() => {
    if (!draggingColumnId) {
      return columnIds;
    }

    const filtered = columnIds.filter((id) => id !== draggingColumnId);

    return filtered.length === columnIds.length ? columnIds : filtered;
  }, [columnIds, draggingColumnId]);

  const handleTrackRef = useCallback(
    (element: HTMLDivElement | null) => {
      registerColumnTrack(element);
    },
    [registerColumnTrack],
  );

  const placementIndex = placement
    ? Math.max(0, Math.min(placement.index, visibleColumnIds.length))
    : -1;

  return (
    <div
      ref={handleTrackRef}
      className={className}
      data-column-track="true"
    >
      {visibleColumnIds.map((columnId, index) => (
        <Fragment key={columnId}>
          {placementIndex === index && placement ? (
            <ColumnDropPlaceholder
              width={placement.width}
              height={placement.height}
            />
          ) : null}
          <Column columnId={columnId} />
        </Fragment>
      ))}
      {placementIndex === visibleColumnIds.length && placement ? (
        <ColumnDropPlaceholder
          width={placement.width}
          height={placement.height}
        />
      ) : null}
      {trailing}
    </div>
  );
}

export const ColumnTrack = memo(ColumnTrackComponent);
