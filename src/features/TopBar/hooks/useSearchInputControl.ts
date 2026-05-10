import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useStore } from "@/store/store";
import { selectSearchTerm, selectSetSearchTerm } from "@/store/selectors";

const SEARCH_INPUT_DEBOUNCE_MS = 250;

export function useSearchInputControl() {
  const searchTerm = useStore(selectSearchTerm);
  const setSearchTerm = useStore(selectSetSearchTerm);
  const [value, setValue] = useState(searchTerm);
  const lastRequestedValueRef = useRef(searchTerm);
  const { schedule, cancel } = useDebounce(
    setSearchTerm,
    SEARCH_INPUT_DEBOUNCE_MS,
  );

  useEffect(() => {
    if (searchTerm === lastRequestedValueRef.current) {
      return;
    }

    lastRequestedValueRef.current = searchTerm;
    setValue(searchTerm);
  }, [searchTerm]);

  const handleChange = useCallback(
    (nextSearchTerm: string) => {
      lastRequestedValueRef.current = nextSearchTerm;
      setValue(nextSearchTerm);
      schedule(nextSearchTerm);
    },
    [schedule],
  );

  const handleClear = useCallback(() => {
    cancel();
    lastRequestedValueRef.current = "";
    setValue("");
    setSearchTerm("");
  }, [cancel, setSearchTerm]);

  return {
    value,
    hasValue: value.trim().length > 0,
    handleChange,
    handleClear,
  };
}
