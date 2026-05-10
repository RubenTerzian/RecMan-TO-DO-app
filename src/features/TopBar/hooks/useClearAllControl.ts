import { useCallback } from "react";
import {
  selectHasActiveTaskFilters,
  selectResetTaskFilters,
} from "@/store/selectors";
import { useStore } from "@/store/store";

export function useClearAllControl() {
  const hasActiveTaskFilters = useStore(selectHasActiveTaskFilters);
  const resetTaskFilters = useStore(selectResetTaskFilters);

  const handleClearAll = useCallback(() => {
    resetTaskFilters();
  }, [resetTaskFilters]);

  return {
    hasActiveTaskFilters,
    handleClearAll,
  };
}
