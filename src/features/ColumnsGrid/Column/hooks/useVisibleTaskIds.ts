import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "@/store/store";
import { selectVisibleTaskIdsByColumn } from "@/store/selectors";

/**
 * Returns the ids of tasks in this column that pass the active filter and
 * search term. Subscribes only to the slices it needs so unrelated state
 * changes (selection, edits in other columns, etc.) do not re-run.
 */
export function useVisibleTaskIds(columnId: string) {
  const selectVisibleTaskIds = useMemo(
    () => selectVisibleTaskIdsByColumn(columnId),
    [columnId],
  );

  return useStore(useShallow(selectVisibleTaskIds));
}
