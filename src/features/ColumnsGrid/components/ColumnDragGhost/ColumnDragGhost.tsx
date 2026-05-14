import { useCallback } from "react";
import { DragGhost } from "@/features/ColumnsGrid/dnd/DragGhost";
import { columnGhostNodeSlot } from "@/features/ColumnsGrid/dnd/ghostNodeSlot";
import {
  getColumnGhostPointerSnapshot,
  subscribeToColumnGhostPointer,
  useColumnDragGhostSnapshot,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";

export function ColumnDragGhost() {
  const snapshot = useColumnDragGhostSnapshot();
  const getSourceNode = useCallback(() => columnGhostNodeSlot.get(), []);
  const subscribeToSourceNode = useCallback(
    (listener: () => void) => columnGhostNodeSlot.subscribe(listener),
    [],
  );

  return (
    <DragGhost
      snapshot={snapshot}
      getSourceNode={getSourceNode}
      subscribeToSourceNode={subscribeToSourceNode}
      getPointer={getColumnGhostPointerSnapshot}
      subscribeToPointer={subscribeToColumnGhostPointer}
      rotateDegrees={2}
    />
  );
}
