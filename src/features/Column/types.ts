export type ColumnEmptyStateVariant = "empty" | "no-results";

export type ColumnEmptyState = {
  variant: ColumnEmptyStateVariant;
  title: string;
  message: string;
};

export type ColumnTaskCard = {
  kind: "task";
  id: string;
  title: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

export type ColumnTaskEditor = {
  kind: "task-editor";
  id: string;
  title: string;
  mode: "create" | "edit";
};

export type ColumnTask = ColumnTaskCard | ColumnTaskEditor;

type ColumnBase = {
  id: string;
  title: string;
  tasks: ColumnTask[];
  emptyState?: ColumnEmptyState;
  showMobileReorderMenu?: boolean;
};

export type DisplayColumn = ColumnBase & {
  kind: "display";
};

export type EditingColumn = ColumnBase & {
  kind: "editor";
  mode: "create" | "edit";
  draftTitle: string;
};

export type ColumnData = DisplayColumn | EditingColumn;
