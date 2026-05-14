import type { TaskFilter } from "@/features/TopBar/types";

type Column = {
  id: string;
  title: string;
};

type Task = {
  id: string;
  columnId: string;
  title: string;
  isComplete: boolean;
};

export type StoreState = {
  columns: Column[];
  tasks: Task[];
  selectedTaskIds: string[];
  selectionMode: boolean;
  activeFilter: TaskFilter;
  searchTerm: string;
};
