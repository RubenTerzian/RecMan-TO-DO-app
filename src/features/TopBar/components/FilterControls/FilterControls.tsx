import styles from "./FilterControls.module.css";
import { Select } from "@/components/atoms/Select/Select";
import type { TaskFilter } from "@/features/TopBar/types";

type FilterControlsProps = {
  activeFilter: TaskFilter;
};

export function FilterControls({ activeFilter }: FilterControlsProps) {
  return (
    <Select
      className={styles.filterControls}
      defaultValue={activeFilter}
      aria-label="Task filter"
      data-testid="filter-controls"
    >
      <option value="all">All</option>
      <option value="complete">Complete</option>
      <option value="incomplete">Incomplete</option>
    </Select>
  );
}
