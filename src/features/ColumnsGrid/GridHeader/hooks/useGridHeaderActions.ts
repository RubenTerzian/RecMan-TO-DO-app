import { useCallback } from "react";
import { useStore } from "@/store/store";
import {
  selectSelectionMode,
  selectToggleSelectionMode,
} from "@/store/selectors";

export function useGridHeaderActions() {
  const selectionMode = useStore(selectSelectionMode);
  const toggleSelectionMode = useStore(selectToggleSelectionMode);

  const handleSelectionModeToggle = useCallback(() => {
    toggleSelectionMode();
  }, [toggleSelectionMode]);

  return {
    selectionMode,
    handleSelectionModeToggle,
  };
}
