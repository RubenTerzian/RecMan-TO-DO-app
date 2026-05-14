import { memo } from "react";
import styles from "./FilterControls.module.css";
import { Select } from "@/components/atoms/Select/Select";
import type { TaskFilter } from "@/features/TopBar/types";
import { useFilterControl } from "@/features/TopBar/hooks/useFilterControl";

function FilterControlsComponent() {
  const { activeFilter, handleChange } = useFilterControl();

  return (
    <Select
      className={styles.filterControls}
      value={activeFilter}
      onChange={(event) => handleChange(event.target.value as TaskFilter)}
      aria-label="Task filter"
      data-active-filter={activeFilter}
    >
      <option value="all">All</option>
      <option value="complete">Complete</option>
      <option value="incomplete">Incomplete</option>
    </Select>
  );
}

export const FilterControls = memo(FilterControlsComponent);
