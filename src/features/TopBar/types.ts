export type TaskFilter = "all" | "complete" | "incomplete";

export type SelectionBulkActionsState = {
  moveTargetId?: string;
  availableColumns: Array<{
    id: string;
    label: string;
  }>;
};

export type TopBarState = {
  searchTerm: string;
  activeFilter: TaskFilter;
  isSelectionMode: boolean;
  selectionCount: number;
  bulkActions?: SelectionBulkActionsState;
};
