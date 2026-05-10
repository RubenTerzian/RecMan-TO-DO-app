import { useEffect } from "react";
import {
  readTaskQueryState,
  writeTaskQueryState,
} from "@/features/TopBar/urlQuery";
import { useStore } from "@/store/store";

export function useTopBarQuerySync() {
  useEffect(() => {
    let previousSearchTerm = useStore.getState().searchTerm;
    let previousActiveFilter = useStore.getState().activeFilter;

    writeTaskQueryState({
      searchTerm: previousSearchTerm,
      activeFilter: previousActiveFilter,
    });

    const unsubscribe = useStore.subscribe((state) => {
      if (
        state.searchTerm === previousSearchTerm &&
        state.activeFilter === previousActiveFilter
      ) {
        return;
      }

      previousSearchTerm = state.searchTerm;
      previousActiveFilter = state.activeFilter;

      writeTaskQueryState({
        searchTerm: state.searchTerm,
        activeFilter: state.activeFilter,
      });
    });

    const handlePopState = () => {
      const nextQueryState = readTaskQueryState();
      const state = useStore.getState();

      if (state.searchTerm !== nextQueryState.searchTerm) {
        state.setSearchTerm(nextQueryState.searchTerm);
      }

      if (state.activeFilter !== nextQueryState.activeFilter) {
        state.setActiveFilter(nextQueryState.activeFilter);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      unsubscribe();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
