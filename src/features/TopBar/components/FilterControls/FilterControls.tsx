import styles from "./FilterControls.module.css";
import { Select } from "@/components/atoms/Select/Select";
import type { TaskFilter } from "@/features/TopBar/types";

type FilterControlsProps = {
  activeFilter: TaskFilter;
  onChange(activeFilter: TaskFilter): void;
};

export function FilterControls({
  activeFilter,
  onChange,
}: FilterControlsProps) {
  return (
    <Select
      className={styles.filterControls}
      value={activeFilter}
      onChange={(event) => onChange(event.target.value as TaskFilter)}
      aria-label="Task filter"
      data-testid="filter-controls"
    >
      <option value="all">All</option>
      <option value="complete">Complete</option>
      <option value="incomplete">Incomplete</option>
    </Select>
  );
}
