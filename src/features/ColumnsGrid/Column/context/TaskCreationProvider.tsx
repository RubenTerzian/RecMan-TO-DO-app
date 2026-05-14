import type { ReactNode } from "react";
import { TaskCreationContext } from "@/features/ColumnsGrid/Column/context/taskCreationContext";
import { useColumnTaskCreation } from "@/features/ColumnsGrid/Column/hooks/useColumnTaskCreation";

/**
 * Hosts the per-column task-creation hook in a context so the trigger
 * (Add task button inside `ColumnHeader`) and the editor slot
 * (`TaskCreationSlot` inside `Column`) can share state without
 * `Column`, `ColumnHeader`, or `ColumnTaskList` subscribing to it.
 * Only the leaf consumers re-render on open/close/commit.
 */
export function TaskCreationProvider({
  columnId,
  children,
}: {
  columnId: string;
  children: ReactNode;
}) {
  const gate = useColumnTaskCreation({ columnId });
  return (
    <TaskCreationContext.Provider value={gate}>
      {children}
    </TaskCreationContext.Provider>
  );
}
