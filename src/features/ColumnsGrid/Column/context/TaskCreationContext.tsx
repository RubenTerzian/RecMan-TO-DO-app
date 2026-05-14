import { createContext, useContext, type ReactNode } from "react";
import { useColumnTaskCreation } from "@/features/ColumnsGrid/Column/hooks/useColumnTaskCreation";

type TaskCreationGate = ReturnType<typeof useColumnTaskCreation>;

const Ctx = createContext<TaskCreationGate | null>(null);

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
  return <Ctx.Provider value={gate}>{children}</Ctx.Provider>;
}

export function useTaskCreationContext() {
  const value = useContext(Ctx);
  if (!value) {
    throw new Error(
      "useTaskCreationContext must be used inside <TaskCreationProvider>",
    );
  }
  return value;
}
