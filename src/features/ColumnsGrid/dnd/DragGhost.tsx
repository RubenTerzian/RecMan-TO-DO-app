import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./DragGhost.module.css";

type GhostPointer = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
};

type DragGhostProps = {
  /** Snapshot of the current drag — width/height drive the wrapper sizing. */
  snapshot: { width: number; height: number } | null;
  /** Store of the cloned source node to mount inside the ghost wrapper. */
  getSourceNode(): HTMLElement | null;
  subscribeToSourceNode(listener: () => void): () => void;
  /** Pointer position store. The wrapper transform is updated imperatively. */
  getPointer(): GhostPointer;
  subscribeToPointer(listener: () => void): () => void;
  /** Visual rotation while dragging, e.g. "3deg" for tasks, "2deg" for columns. */
  rotateDegrees: number;
};

function applyTransform(
  node: HTMLDivElement | null,
  getPointer: DragGhostProps["getPointer"],
  rotateDegrees: number,
) {
  if (!node) {
    return;
  }

  const pointer = getPointer();

  if (!pointer.active) {
    node.style.opacity = "0";
    return;
  }

  const x = pointer.x - pointer.offsetX;
  const y = pointer.y - pointer.offsetY;

  node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotateDegrees}deg)`;
  node.style.opacity = "1";
}

function DragGhostComponent({
  snapshot,
  getSourceNode,
  subscribeToSourceNode,
  getPointer,
  subscribeToPointer,
  rotateDegrees,
}: DragGhostProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Mount the cloned source node inside the wrapper. This gives the ghost
  // a pixel-perfect copy of the original element including all of its CSS,
  // current state classes, and content. Re-runs whenever the source node
  // changes (e.g. a new drag starts).
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const wrapper = wrapperRef.current;

    const mount = () => {
      const sourceNode = getSourceNode();

      if (!wrapper) {
        return;
      }

      wrapper.replaceChildren();

      if (sourceNode) {
        wrapper.appendChild(sourceNode);
      }
    };

    mount();

    return subscribeToSourceNode(mount);
  }, [snapshot, getSourceNode, subscribeToSourceNode]);

  // Follow the cursor by mutating the wrapper transform directly — never
  // re-renders React during pointer movement.
  useEffect(() => {
    if (!snapshot) {
      return;
    }

    applyTransform(wrapperRef.current, getPointer, rotateDegrees);

    return subscribeToPointer(() => {
      applyTransform(wrapperRef.current, getPointer, rotateDegrees);
    });
  }, [snapshot, getPointer, subscribeToPointer, rotateDegrees]);

  if (!snapshot || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={(node) => {
        wrapperRef.current = node;
        applyTransform(node, getPointer, rotateDegrees);
      }}
      className={styles.ghost}
      style={{
        width: `${snapshot.width}px`,
        height: `${snapshot.height}px`,
      }}
    />,
    document.body,
  );
}

export const DragGhost = memo(DragGhostComponent);
