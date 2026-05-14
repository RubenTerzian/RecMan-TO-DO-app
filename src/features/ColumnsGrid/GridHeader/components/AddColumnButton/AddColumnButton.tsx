import type { PointerEventHandler } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { useColumnCreationContext } from "@/features/ColumnsGrid/context/columnCreationContext";
import styles from "./AddColumnButton.module.css";

/**
 * Leaf subscriber for the column-creation gate. Sits inside
 * `GridHeader` but reads its own state, so `GridHeader` itself never
 * re-renders when the editor opens or closes.
 */
export function AddColumnButton() {
  const { isCreatingColumn, handleStartColumnCreation } =
    useColumnCreationContext();

  // While the editor is open, prevent the surrounding wrapper from
  // stealing focus from the editor on a stray click.
  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isCreatingColumn) {
      return;
    }
    event.preventDefault();
  };

  return (
    <div className={styles.wrapper} onPointerDown={handlePointerDown}>
      <Button
        className={styles.button}
        variant="primary"
        disabled={isCreatingColumn}
        onClick={isCreatingColumn ? undefined : handleStartColumnCreation}
      >
        + Add Column
      </Button>
    </div>
  );
}
