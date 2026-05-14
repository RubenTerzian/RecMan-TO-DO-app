import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useStore } from "@/store/store";

const SEARCH_INPUT_DEBOUNCE_MS = 250;

/**
 * Owns the search input value via a DOM ref (uncontrolled) so typing does
 * not re-render the host component. Only flips a `hasValue` boolean when
 * the input transitions between empty and non-empty for the clear button.
 *
 * External resets (Clear all, popstate) imperatively reset the DOM value
 * via the returned `inputRef`.
 */
export function useSearchInputControl() {
  // Captured once. The input is uncontrolled after this point, so we
  // hold the seed value in state (read at mount) instead of a ref so
  // we never read a ref's `.current` during render.
  const [initialValue] = useState(() => useStore.getState().searchTerm);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastWrittenValueRef = useRef(initialValue);
  const [hasValue, setHasValue] = useState(
    () => initialValue.trim().length > 0,
  );

  const { schedule, cancel } = useDebounce((nextValue: string) => {
    lastWrittenValueRef.current = nextValue;
    useStore.getState().setSearchTerm(nextValue);
  }, SEARCH_INPUT_DEBOUNCE_MS);

  // External resets only — never on our own writes.
  useEffect(() => {
    return useStore.subscribe((state) => {
      if (state.searchTerm === lastWrittenValueRef.current) {
        return;
      }

      lastWrittenValueRef.current = state.searchTerm;

      if (inputRef.current && inputRef.current.value !== state.searchTerm) {
        inputRef.current.value = state.searchTerm;
      }

      setHasValue(state.searchTerm.trim().length > 0);
    });
  }, []);

  const handleInputChange = useCallback(
    (nextValue: string) => {
      const nextHasValue = nextValue.trim().length > 0;

      setHasValue((current) =>
        current === nextHasValue ? current : nextHasValue,
      );
      schedule(nextValue);
    },
    [schedule],
  );

  const handleClear = useCallback(() => {
    cancel();
    lastWrittenValueRef.current = "";

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    setHasValue(false);
    useStore.getState().setSearchTerm("");
  }, [cancel]);

  return {
    inputRef,
    initialValue,
    hasValue,
    handleInputChange,
    handleClear,
  };
}
