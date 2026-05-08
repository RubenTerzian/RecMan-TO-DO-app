import type { TaskFilter } from "@/features/TopBar/types";

export type BoardColumn = {
  id: string;
  title: string;
};

export type BoardTask = {
  id: string;
  columnId: string;
  title: string;
  isComplete: boolean;
};

export type BoardState = {
  columns: BoardColumn[];
  tasks: BoardTask[];
  selectionMode: boolean;
  activeFilter: TaskFilter;
  searchTerm: string;
};
