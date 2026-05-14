import { createContext, useContext } from "react";
import type { useColumnCreation } from "@/features/ColumnsGrid/hooks/useColumnCreation";

export type ColumnCreationGate = ReturnType<typeof useColumnCreation>;

export const ColumnCreationContext = createContext<ColumnCreationGate | null>(
  null,
);

export function useColumnCreationContext() {
  const value = useContext(ColumnCreationContext);
  if (!value) {
    throw new Error(
      "useColumnCreationContext must be used inside <ColumnCreationProvider>",
    );
  }
  return value;
}
