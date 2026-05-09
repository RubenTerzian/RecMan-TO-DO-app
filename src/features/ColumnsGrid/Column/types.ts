export type ColumnEmptyStateVariant = "empty" | "no-results";

import type {
  TaskCardData,
  TaskEditorData,
} from "@/features/ColumnsGrid/Task/types";

export type ColumnEmptyState = {
  variant: ColumnEmptyStateVariant;
  title: string;
  message: string;
};

type ColumnBase = {
  id: string;
  title: string;
  tasks: TaskCardData[];
  taskEditor?: TaskEditorData;
  emptyState?: ColumnEmptyState;
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
