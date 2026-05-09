import type { PropsWithChildren } from "react";
import {
  TaskDragAndDropContext,
  type TaskDragAndDropContextValue,
} from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";

export function TaskDragAndDropProvider({
  children,
  value,
}: PropsWithChildren<{ value: TaskDragAndDropContextValue }>) {
  return (
    <TaskDragAndDropContext.Provider value={value}>
      {children}
    </TaskDragAndDropContext.Provider>
  );
}
