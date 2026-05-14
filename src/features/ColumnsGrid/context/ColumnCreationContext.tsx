import { createContext, useContext, type ReactNode } from "react";
import { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";

type ColumnCreationGate = ReturnType<typeof useColumnCreation>;

const Ctx = createContext<ColumnCreationGate | null>(null);

/**
 * Hosts the column-creation hook in a context so the trigger button
 * (in `GridHeader`) and the trailing editor slot (in `BoardSurface`)
 * can share state without their common ancestor (`ColumnsGrid`)
 * subscribing to it. Only the leaf consumers re-render on
 * open/close/commit; everything else stays put.
 */
export function ColumnCreationProvider({ children }: { children: ReactNode }) {
  const gate = useColumnCreation();
  return <Ctx.Provider value={gate}>{children}</Ctx.Provider>;
}

export function useColumnCreationContext() {
  const value = useContext(Ctx);
  if (!value) {
    throw new Error(
      "useColumnCreationContext must be used inside <ColumnCreationProvider>",
    );
  }
  return value;
}
