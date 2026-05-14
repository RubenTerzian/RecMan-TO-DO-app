import type { RefObject } from "react";
import { ColumnTrack } from "@/features/ColumnsGrid/components/ColumnTrack/ColumnTrack";
import { CreateColumnSection } from "@/features/ColumnsGrid/components/CreateColumnSection/CreateColumnSection";
import { EmptyBoardState } from "@/features/ColumnsGrid/components/EmptyBoardState/EmptyBoardState";
import { useColumnCreationContext } from "@/features/ColumnsGrid/context/columnCreationContext";

type BoardSurfaceProps = {
  className: string;
  columnIds: string[];
  boardViewportRef: RefObject<HTMLDivElement | null>;
};

/**
 * Switches between the empty state and the column track. Lives here
 * (not in `ColumnsGrid`) so subscribing to the creation gate only
 * re-renders this small component when toggling between empty and
 * "creating first column" — never the whole board.
 */
export function BoardSurface({
  className,
  columnIds,
  boardViewportRef,
}: BoardSurfaceProps) {
  const { isCreatingColumn } = useColumnCreationContext();
  const isBoardEmpty = columnIds.length === 0;

  if (isBoardEmpty && !isCreatingColumn) {
    return <EmptyBoardState />;
  }

  return (
    <ColumnTrack
      className={className}
      columnIds={columnIds}
      trailing={<CreateColumnSection boardViewportRef={boardViewportRef} />}
    />
  );
}
