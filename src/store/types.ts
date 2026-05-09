import type { TaskFilter } from "@/features/TopBar/types";

export type Column = {
  id: string;
  title: string;
};

export type Task = {
  id: string;
  columnId: string;
  title: string;
  isComplete: boolean;
};

export type StoreState = {
  columns: Column[];
  tasks: Task[];
  selectionMode: boolean;
  activeFilter: TaskFilter;
  searchTerm: string;
};
