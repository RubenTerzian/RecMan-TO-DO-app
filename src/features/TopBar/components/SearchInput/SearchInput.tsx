import { memo } from "react";
import styles from "./SearchInput.module.css";
import { Input } from "@/components/atoms/Input/Input";
import { useSearchInputControl } from "@/features/TopBar/hooks/useSearchInputControl";

function SearchInputComponent() {
  const { value, hasValue, handleChange, handleClear } =
    useSearchInputControl();

  return (
    <div className={styles.searchInputWrap}>
      <Input
        className={styles.searchInput}
        data-testid="search-input"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search tasks"
      />
      {hasValue ? (
        <button
          aria-label="Clear search"
          className={styles.clearButton}
          onClick={handleClear}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export const SearchInput = memo(SearchInputComponent);
