import { createContext, useContext } from "react";
import type { useColumnTaskCreation } from "@/features/ColumnsGrid/Column/hooks/useColumnTaskCreation";

export type TaskCreationGate = ReturnType<typeof useColumnTaskCreation>;

export const TaskCreationContext = createContext<TaskCreationGate | null>(null);

export function useTaskCreationContext() {
  const value = useContext(TaskCreationContext);
  if (!value) {
    throw new Error(
      "useTaskCreationContext must be used inside <TaskCreationProvider>",
    );
  }
  return value;
}
