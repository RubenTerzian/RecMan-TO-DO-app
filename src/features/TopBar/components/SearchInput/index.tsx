import styles from "./SearchInput.module.css";
import { Input } from "@/components/atoms/Input";

type SearchInputProps = {
  value: string;
};

export function SearchInput({ value }: SearchInputProps) {
  return (
    <Input
      className={styles.searchInput}
      data-testid="search-input"
      value={value}
      readOnly
      placeholder="Search tasks"
    />
  );
}
