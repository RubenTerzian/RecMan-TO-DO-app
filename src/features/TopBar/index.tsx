import { CreateColumnButton } from "@/components/shared/CreateColumnButton";
import styles from "./TopBar.module.css";
import { SearchInput } from "@/features/TopBar/components/SearchInput";
import { FilterControls } from "@/features/TopBar/components/FilterControls";
import { SelectionActionBar } from "@/features/TopBar/components/SelectionActionBar";
import { SelectionModeToggle } from "@/features/TopBar/components/SelectionModeToggle";
import type { TopBarState } from "@/features/TopBar/types";

const topBarState: TopBarState = {
  mode: "default",
  searchTerm: "",
  activeFilter: "all",
};

export function TopBar() {
  const isSelectionMode = topBarState.mode === "selection";

  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.controlsCard}>
        <div className={styles.controls}>
          <SearchInput value={topBarState.searchTerm} />
          <FilterControls activeFilter={topBarState.activeFilter} />

          <div className={styles.actionsGroup}>
            <SelectionModeToggle enabled={isSelectionMode} />

            {!isSelectionMode ? <CreateColumnButton /> : null}
          </div>
        </div>

        {isSelectionMode ? (
          <SelectionActionBar
            bulkActions={topBarState.bulkActions}
            selectionCount={topBarState.selectionCount}
          />
        ) : null}
      </div>
    </header>
  );
}
