import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useStore } from "@/store/store";
import { selectSetSearchTerm } from "@/store/selectors";

const SEARCH_INPUT_DEBOUNCE_MS = 250;

export function useSearchInputControl() {
  const setSearchTerm = useStore(selectSetSearchTerm);
  const [value, setValue] = useState(() => useStore.getState().searchTerm);
  const debouncedSetSearchTerm = useDebounce(
    setSearchTerm,
    SEARCH_INPUT_DEBOUNCE_MS,
  );

  const handleChange = useCallback(
    (nextSearchTerm: string) => {
      setValue(nextSearchTerm);
      debouncedSetSearchTerm(nextSearchTerm);
    },
    [debouncedSetSearchTerm],
  );

  return {
    value,
    handleChange,
  };
}
