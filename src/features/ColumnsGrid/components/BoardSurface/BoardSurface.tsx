import type { RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import { ColumnTrack } from "@/features/ColumnsGrid/components/ColumnTrack/ColumnTrack";
import { CreateColumnSection } from "@/features/ColumnsGrid/components/CreateColumnSection/CreateColumnSection";
import { EmptyBoardState } from "@/features/ColumnsGrid/components/EmptyBoardState/EmptyBoardState";
import { useColumnCreationContext } from "@/features/ColumnsGrid/context/columnCreationContext";
import { selectColumnIds } from "@/store/selectors";
import { useStore } from "@/store/store";

type BoardSurfaceProps = {
  className: string;
  boardViewportRef: RefObject<HTMLDivElement | null>;
};

/**
 * Owns both the board's "empty vs columns" switch and the column-id
 * subscription. `ColumnsGrid` stays static — column creation, reorder,
 * delete, and add only re-render this component and its subtree, never
 * the surrounding layout, header, or DnD provider chain.
 */
export function BoardSurface({
  className,
  boardViewportRef,
}: BoardSurfaceProps) {
  const columnIds = useStore(useShallow(selectColumnIds));
  const { isCreatingColumn } = useColumnCreationContext();

  if (columnIds.length === 0 && !isCreatingColumn) {
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
