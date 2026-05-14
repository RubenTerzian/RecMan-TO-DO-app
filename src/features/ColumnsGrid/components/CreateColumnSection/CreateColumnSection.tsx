import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { ColumnEditor } from "@/features/ColumnsGrid/Column/components/ColumnEditor/ColumnEditor";
import { useColumnCreationContext } from "@/features/ColumnsGrid/context/columnCreationContext";
import columnStyles from "@/features/ColumnsGrid/Column/Column.module.css";

type CreateColumnSectionProps = {
  /**
   * Viewport that should scroll to the right when the editor opens
   * so the trailing editor (and its actions) are in view.
   */
  boardViewportRef: RefObject<HTMLDivElement | null>;
};

/**
 * Trailing column-creation editor. Subscribes to the creation gate
 * via context, so neither `ColumnsGrid` nor `GridHeader` re-render
 * when the editor opens, closes, or commits. The editor itself is
 * uncontrolled, so keystrokes don't even reach this component.
 */
export function CreateColumnSection({
  boardViewportRef,
}: CreateColumnSectionProps) {
  const {
    isCreatingColumn,
    defaultTitle,
    handleSaveColumnCreation,
    handleCancelColumnCreation,
  } = useColumnCreationContext();

  // Track previous flag so the scroll effect only fires on the
  // open transition.
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isCreatingColumn) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) {
      return;
    }
    wasOpenRef.current = true;

    const viewport = boardViewportRef.current;
    if (!viewport) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      viewport.scrollTo({ left: viewport.scrollWidth, behavior: "smooth" });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [boardViewportRef, isCreatingColumn]);

  if (!isCreatingColumn) {
    return null;
  }

  return (
    <section className={columnStyles.column}>
      <ColumnEditor
        autoFocus
        initialTitle={defaultTitle}
        mode="create"
        onCancel={handleCancelColumnCreation}
        onSave={handleSaveColumnCreation}
      />
    </section>
  );
}
