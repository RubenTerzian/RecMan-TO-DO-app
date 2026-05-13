import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getColumnGhostPointerSnapshot,
  subscribeToColumnGhostPointer,
  useColumnDragGhostSnapshot,
} from "@/features/ColumnsGrid/hooks/useColumnDragAndDrop";
import styles from "./ColumnDragGhost.module.css";

function applyTransform(node: HTMLDivElement | null) {
  if (!node) {
    return;
  }

  const pointer = getColumnGhostPointerSnapshot();

  if (!pointer.active) {
    node.style.opacity = "0";
    return;
  }

  const x = pointer.x - pointer.offsetX;
  const y = pointer.y - pointer.offsetY;

  node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(2deg)`;
  node.style.opacity = "1";
}

function ColumnDragGhostComponent() {
  const ghost = useColumnDragGhostSnapshot();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  // Track pointer movement imperatively so dragging never re-renders React.
  useEffect(() => {
    if (!ghost) {
      return;
    }

    applyTransform(nodeRef.current);

    return subscribeToColumnGhostPointer(() => {
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
      data-testid="column-drag-ghost"
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

export const ColumnDragGhost = memo(ColumnDragGhostComponent);
