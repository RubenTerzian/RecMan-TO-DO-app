import { memo } from "react";
import styles from "./FilterControls.module.css";
import { Select } from "@/components/atoms/Select/Select";
import type { TaskFilter } from "@/features/TopBar/types";
import { selectActiveFilter, selectSetActiveFilter } from "@/store/selectors";
import { useStore } from "@/store/store";

function FilterControlsComponent() {
  const activeFilter = useStore(selectActiveFilter);
  const setActiveFilter = useStore(selectSetActiveFilter);

  return (
    <Select
      className={styles.filterControls}
      value={activeFilter}
      onChange={(event) => setActiveFilter(event.target.value as TaskFilter)}
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
