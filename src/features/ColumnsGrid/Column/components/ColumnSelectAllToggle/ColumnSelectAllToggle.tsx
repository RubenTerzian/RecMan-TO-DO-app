import { memo, useCallback } from "react";
import { useStore } from "@/store/store";
import { useVisibleTaskIds } from "@/features/ColumnsGrid/Column/hooks/useVisibleTaskIds";

type ColumnSelectAllToggleProps = {
  columnId: string;
  className?: string;
};

function ColumnSelectAllToggleComponent({
  columnId,
  className,
}: ColumnSelectAllToggleProps) {
  const visibleTaskIds = useVisibleTaskIds(columnId);

  // Subscribe to a derived primitive: re-renders only when this column's
  // "all selected" boolean actually flips, not on every selection change.
  const allSelected = useStore((state) => {
    if (visibleTaskIds.length === 0) {
      return false;
    }

    const selected = state.selectedTaskIds;

    for (const id of visibleTaskIds) {
      if (!selected.includes(id)) {
        return false;
      }
    }

    return true;
  });

  const handleClick = useCallback(() => {
    useStore.getState().toggleAllTaskSelection(visibleTaskIds);
  }, [visibleTaskIds]);

  if (visibleTaskIds.length === 0) {
    return null;
  }

  return (
    <button className={className} type="button" onClick={handleClick}>
      {allSelected ? "Deselect all" : "Select all"}
    </button>
  );
}

export const ColumnSelectAllToggle = memo(ColumnSelectAllToggleComponent);
