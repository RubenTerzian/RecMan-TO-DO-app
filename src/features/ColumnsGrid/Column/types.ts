export type ColumnEmptyStateVariant = "empty" | "no-results";

export type ColumnEmptyState = {
  variant: ColumnEmptyStateVariant;
  title: string;
  message: string;
};
