import { useCallback } from "react";
import type { TaskFilter } from "@/features/TopBar/types";
import { useStore } from "@/store/store";
import { selectActiveFilter, selectSetActiveFilter } from "@/store/selectors";

export function useFilterControl() {
  const activeFilter = useStore(selectActiveFilter);
  const setActiveFilter = useStore(selectSetActiveFilter);

  const handleChange = useCallback(
    (nextActiveFilter: TaskFilter) => {
      setActiveFilter(nextActiveFilter);
    },
    [setActiveFilter],
  );

  return {
    activeFilter,
    handleChange,
  };
}
