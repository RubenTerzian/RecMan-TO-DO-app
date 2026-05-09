import styles from "./TopBar.module.css";
import { SearchInput } from "@/features/TopBar/components/SearchInput/SearchInput";
import { FilterControls } from "@/features/TopBar/components/FilterControls/FilterControls";

export function TopBar() {
  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.controlsCard}>
        <div className={styles.controls}>
          <SearchInput />
          <FilterControls />
        </div>
      </div>
    </header>
  );
}
