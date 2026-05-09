import { memo } from "react";
import styles from "./SearchInput.module.css";
import { Input } from "@/components/atoms/Input/Input";
import { useSearchInputControl } from "@/features/TopBar/hooks/useSearchInputControl";

function SearchInputComponent() {
  const { value, handleChange } = useSearchInputControl();

  return (
    <Input
      className={styles.searchInput}
      data-testid="search-input"
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      placeholder="Search tasks"
    />
  );
}

export const SearchInput = memo(SearchInputComponent);
