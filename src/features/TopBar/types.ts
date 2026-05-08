export type TaskFilter = "all" | "complete" | "incomplete";

export type TopBarState = {
  searchTerm: string;
  activeFilter: TaskFilter;
  isSelectionMode: boolean;
  selectionCount: number;
};
