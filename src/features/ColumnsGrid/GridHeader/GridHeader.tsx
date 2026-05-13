import type { PointerEventHandler } from "react";
import { CreateColumnButton } from "@/components/shared/CreateColumnButton/CreateColumnButton";
import { SelectionActionBar } from "@/features/ColumnsGrid/GridHeader/components/SelectionActionBar/SelectionActionBar";
import { SelectionModeToggle } from "@/features/ColumnsGrid/GridHeader/components/SelectionModeToggle/SelectionModeToggle";
import styles from "./GridHeader.module.css";
import { useGridHeaderActions } from "./hooks/useGridHeaderActions";

type GridHeaderProps = {
  hasColumns: boolean;
  isCreateColumnDisabled?: boolean;
  onCreateColumn?(): void;
};

export function GridHeader({
  hasColumns,
  isCreateColumnDisabled = false,
  onCreateColumn,
}: GridHeaderProps) {
  const handleCreateColumnPointerDown: PointerEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!isCreateColumnDisabled) {
      return;
    }

    event.preventDefault();
  };

  const { selectionMode, handleSelectionModeToggle } = useGridHeaderActions();

  return (
    <header className={styles.gridHeader} data-testid="grid-header">
      <div className={styles.actionsRow}>
        {hasColumns ? (
          <SelectionModeToggle
            className={styles.selectionModeButton}
            enabled={selectionMode}
            onToggle={handleSelectionModeToggle}
          />
        ) : null}

        {!selectionMode ? (
          <div
            className={styles.createColumnButtonWrapper}
            onPointerDown={handleCreateColumnPointerDown}
          >
            <CreateColumnButton
              className={styles.createColumnButton}
              disabled={isCreateColumnDisabled}
              onClick={isCreateColumnDisabled ? undefined : onCreateColumn}
            />
          </div>
        ) : null}
      </div>

      {selectionMode && hasColumns ? (
        <SelectionActionBar className={styles.selectionActionBar} />
      ) : null}
    </header>
  );
}
