import styles from "./TopBar.module.css";
import { SearchInput } from "@/features/TopBar/components/SearchInput/SearchInput";
import { FilterControls } from "@/features/TopBar/components/FilterControls/FilterControls";
import { useTopBarControls } from "@/hooks/useTopBarControls";

export function TopBar() {
  const { searchTerm, activeFilter, onSearchTermChange, onActiveFilterChange } =
    useTopBarControls();

  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.controlsCard}>
        <div className={styles.controls}>
          <SearchInput value={searchTerm} onChange={onSearchTermChange} />
          <FilterControls
            activeFilter={activeFilter}
            onChange={onActiveFilterChange}
          />
        </div>
      </div>
    </header>
  );
}
