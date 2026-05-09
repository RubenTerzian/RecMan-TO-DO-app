import { useCallback } from "react";
import type { TaskFilter } from "@/features/TopBar/types";
import { useStore } from "@/store/store";

export function useTopBarControls() {
  const searchTerm = useStore((state) => state.searchTerm);
  const activeFilter = useStore((state) => state.activeFilter);
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const setActiveFilter = useStore((state) => state.setActiveFilter);

  const onSearchTermChange = useCallback(
    (nextSearchTerm: string) => {
      setSearchTerm(nextSearchTerm);
    },
    [setSearchTerm],
  );

  const onActiveFilterChange = useCallback(
    (nextActiveFilter: TaskFilter) => {
      setActiveFilter(nextActiveFilter);
    },
    [setActiveFilter],
  );

  return {
    searchTerm,
    activeFilter,
    onSearchTermChange,
    onActiveFilterChange,
  };
}
