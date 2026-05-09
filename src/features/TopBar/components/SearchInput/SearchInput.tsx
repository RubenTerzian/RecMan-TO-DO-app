import styles from "./SearchInput.module.css";
import { Input } from "@/components/atoms/Input/Input";

type SearchInputProps = {
  value: string;
  onChange(value: string): void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <Input
      className={styles.searchInput}
      data-testid="search-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search tasks"
    />
  );
}
