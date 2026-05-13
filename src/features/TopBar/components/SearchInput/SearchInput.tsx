import { memo, useCallback, type ChangeEvent } from "react";
import styles from "./SearchInput.module.css";
import { Input } from "@/components/atoms/Input/Input";
import { useSearchInputControl } from "@/features/TopBar/hooks/useSearchInputControl";

const preventMouseDown = (event: { preventDefault(): void }) =>
  event.preventDefault();

function SearchInputComponent() {
  const { inputRef, initialValue, hasValue, handleInputChange, handleClear } =
    useSearchInputControl();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleInputChange(event.target.value);
    },
    [handleInputChange],
  );

  return (
    <div className={styles.searchInputWrap}>
      <Input
        ref={inputRef}
        className={styles.searchInput}
        data-testid="search-input"
        defaultValue={initialValue}
        onChange={onChange}
        placeholder="Search tasks"
      />
      {hasValue ? (
        <button
          aria-label="Clear search"
          className={styles.clearButton}
          onClick={handleClear}
          onMouseDown={preventMouseDown}
          type="button"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export const SearchInput = memo(SearchInputComponent);
