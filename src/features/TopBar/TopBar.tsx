import styles from "./TopBar.module.css";
import { ClearAllButton } from "@/features/TopBar/components/ClearAllButton/ClearAllButton";
import { SearchInput } from "@/features/TopBar/components/SearchInput/SearchInput";
import { FilterControls } from "@/features/TopBar/components/FilterControls/FilterControls";
import { useTopBarQuerySync } from "@/features/TopBar/hooks/useTopBarQuerySync";

export function TopBar() {
  useTopBarQuerySync();

  return (
    <header className={styles.topBar}>
      <div className={styles.controlsCard}>
        <div className={styles.controls}>
          <SearchInput />
          <FilterControls />
          <ClearAllButton />
        </div>
      </div>
    </header>
  );
}
