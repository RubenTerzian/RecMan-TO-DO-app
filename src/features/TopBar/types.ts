export type TaskFilter = "all" | "complete" | "incomplete";

export type SelectionBulkActionsState = {
  moveTargetId?: string;
  availableColumns: Array<{
    id: string;
    label: string;
  }>;
};

type TopBarBaseState = {
  searchTerm: string;
  activeFilter: TaskFilter;
};

export type DefaultTopBarState = TopBarBaseState & {
  mode: "default";
};

export type SelectionTopBarState = TopBarBaseState & {
  mode: "selection";
  selectionCount: number;
  bulkActions: SelectionBulkActionsState;
};

export type TopBarState = DefaultTopBarState | SelectionTopBarState;
