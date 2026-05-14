import { useCallback } from "react";
import { DragGhost } from "@/features/ColumnsGrid/dnd/DragGhost";
import { taskGhostNodeSlot } from "@/features/ColumnsGrid/dnd/ghostNodeSlot";
import {
  getGhostPointerSnapshot,
  subscribeToGhostPointer,
  useDragGhostSnapshot,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";

export function TaskDragGhost() {
  const snapshot = useDragGhostSnapshot();
  const getSourceNode = useCallback(() => taskGhostNodeSlot.get(), []);
  const subscribeToSourceNode = useCallback(
    (listener: () => void) => taskGhostNodeSlot.subscribe(listener),
    [],
  );

  return (
    <DragGhost
      snapshot={snapshot}
      getSourceNode={getSourceNode}
      subscribeToSourceNode={subscribeToSourceNode}
      getPointer={getGhostPointerSnapshot}
      subscribeToPointer={subscribeToGhostPointer}
      rotateDegrees={3}
    />
  );
}
