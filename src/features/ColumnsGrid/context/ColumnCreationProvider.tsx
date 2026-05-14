import type { ReactNode } from "react";
import { ColumnCreationContext } from "@/features/ColumnsGrid/context/columnCreationContext";
import { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";

/**
 * Hosts the column-creation hook in a context so the trigger button
 * (in `GridHeader`) and the trailing editor slot (in `BoardSurface`)
 * can share state without their common ancestor (`ColumnsGrid`)
 * subscribing to it. Only the leaf consumers re-render on
 * open/close/commit; everything else stays put.
 */
export function ColumnCreationProvider({ children }: { children: ReactNode }) {
  const gate = useColumnCreation();
  return (
    <ColumnCreationContext.Provider value={gate}>
      {children}
    </ColumnCreationContext.Provider>
  );
}
