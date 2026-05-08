import {
  MOCK_SCREEN_OPTIONS,
  type MockScreenId,
} from "../../../../app/mockScreens";
import styles from "./TopBar.module.css";
import { SearchInput } from "@/features/TopBar/components/SearchInput/index";
import { FilterControls } from "@/features/TopBar/components/FilterControls/index";
import { SelectionModeToggle } from "@/features/TopBar/components/SelectionModeToggle/index";
import { SelectionActionBar } from "@/features/TopBar/components/SelectionActionBar/index";
import type { TopBarState } from "@/features/TopBar/types";

type TopBarProps = {
  activeScreen: MockScreenId;
  screenLabel: string;
  state: TopBarState;
  onScreenChange: (screen: MockScreenId) => void;
};

export function TopBar({
  activeScreen,
  screenLabel,
  state,
  onScreenChange,
}: TopBarProps) {
  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.headerRow}>
        <div className={styles.brandBlock}>
          <p className={styles.kicker}>RecMan TODO</p>
          <h1 className={styles.title}>Responsive mock states</h1>
          <p className={styles.description}>
            Static screens for layout review before store and drag logic are
            wired.
          </p>
        </div>

        <div className={styles.stateSwitcher} data-testid="mock-state-switcher">
          {MOCK_SCREEN_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.stateButton}
              data-active={option.id === activeScreen}
              data-testid={`mock-screen-${option.id}`}
              onClick={() => onScreenChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.controlsCard}>
        <div className={styles.controlsMeta}>
          <span className={styles.controlsEyebrow}>Showing</span>
          <strong className={styles.controlsCopy}>{screenLabel}</strong>
        </div>

        <div className={styles.controls}>
          <SearchInput value={state.searchTerm} />
          <FilterControls activeFilter={state.activeFilter} />
          <SelectionModeToggle enabled={state.isSelectionMode} />
          <SelectionActionBar selectionCount={state.selectionCount} />
        </div>
      </div>
    </header>
  );
}
