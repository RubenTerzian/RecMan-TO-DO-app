import type { TaskFilter } from "@/features/TopBar/types";

export function useTopBarState() {
  return {
    searchTerm: "",
    activeFilter: "all" as TaskFilter,
    isSelectionMode: false,
    selectionCount: 0,
  };
}
