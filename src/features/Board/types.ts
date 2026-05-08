import type { ColumnData } from "@/features/Column/types";

export type BoardState = {
  columns: ColumnData[];
  selectionMode?: boolean;
  showCreateColumnCard?: boolean;
};
