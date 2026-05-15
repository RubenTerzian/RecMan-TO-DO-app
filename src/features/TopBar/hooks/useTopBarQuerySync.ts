import { useEffect } from "react";
import {
  readTaskQueryState,
  writeTaskQueryState,
} from "@/features/TopBar/urlQuery";
import { selectActiveFilter, selectSearchTerm } from "@/store/selectors";
import { useStore } from "@/store/store";

/**
 * One-way mirror of `searchTerm` / `activeFilter` from store to URL,
 * plus a back/forward bridge from URL to store on `popstate`.
 *
 * The store is the runtime source of truth (multiple actions and
 * selectors read it synchronously). The URL exists for shareability
 * and back/forward navigation. Initial URL hydration happens once at
 * store-module load (see `URL_QUERY_SEED` in `store.ts`).
 */
export function useTopBarQuerySync() {
  useEffect(() => {
    let lastWrittenSearchTerm = useStore.getState().searchTerm;
    let lastWrittenActiveFilter = useStore.getState().activeFilter;

    const unsubscribe = useStore.subscribe((state) => {
      const nextSearchTerm = selectSearchTerm(state);
      const nextActiveFilter = selectActiveFilter(state);

      if (
        nextSearchTerm === lastWrittenSearchTerm &&
        nextActiveFilter === lastWrittenActiveFilter
      ) {
        return;
      }

      lastWrittenSearchTerm = nextSearchTerm;
      lastWrittenActiveFilter = nextActiveFilter;

      writeTaskQueryState({
        searchTerm: nextSearchTerm,
        activeFilter: nextActiveFilter,
      });
    });

    const handlePopState = () => {
      const fromUrl = readTaskQueryState();
      const { searchTerm, activeFilter, setSearchTerm, setActiveFilter } =
        useStore.getState();

      if (searchTerm !== fromUrl.searchTerm) {
        setSearchTerm(fromUrl.searchTerm);
      }
      if (activeFilter !== fromUrl.activeFilter) {
        setActiveFilter(fromUrl.activeFilter);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      unsubscribe();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
