import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getGhostPointerSnapshot,
  subscribeToGhostPointer,
  useDragGhostSnapshot,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import styles from "./TaskDragGhost.module.css";

function applyTransform(node: HTMLDivElement | null) {
  if (!node) {
    return;
  }

  const pointer = getGhostPointerSnapshot();

  if (!pointer.active) {
    node.style.opacity = "0";
    return;
  }

  const x = pointer.x - pointer.offsetX;
  const y = pointer.y - pointer.offsetY;

  node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(3deg)`;
  node.style.opacity = "1";
}

function TaskDragGhostComponent() {
  const ghost = useDragGhostSnapshot();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to pointer movement and update DOM transform directly so the
  // ghost follows the cursor without re-rendering React.
  useEffect(() => {
    if (!ghost) {
      return;
    }

    applyTransform(nodeRef.current);

    return subscribeToGhostPointer(() => {
      applyTransform(nodeRef.current);
    });
  }, [ghost]);

  if (!ghost || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={(node) => {
        nodeRef.current = node;
        applyTransform(node);
      }}
      className={styles.ghost}
      data-testid="task-drag-ghost"
      style={{
        width: `${ghost.width}px`,
        height: `${ghost.height}px`,
      }}
    >
      <span className={styles.title}>{ghost.title}</span>
    </div>,
    document.body,
  );
}

export const TaskDragGhost = memo(TaskDragGhostComponent);
