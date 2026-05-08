import {
  MOCK_SCREEN_OPTIONS,
  type MockScreenId,
} from "../../../../app/mockScreens";
import styles from "./TopBar.module.css";
import { Button } from "@/components/atoms/Button/index";
import { useColumnActions } from "@/features/Column/hooks/useColumnActions";
import { SearchInput } from "@/features/TopBar/components/SearchInput/index";
import { FilterControls } from "@/features/TopBar/components/FilterControls/index";
import { SelectionModeToggle } from "@/features/TopBar/components/SelectionModeToggle/index";
import type { TopBarState } from "@/features/TopBar/types";

type TopBarProps = {
  activeScreen: MockScreenId;
  state: TopBarState;
  onScreenChange: (screen: MockScreenId) => void;
};

export function TopBar({ activeScreen, state, onScreenChange }: TopBarProps) {
  const { createColumn } = useColumnActions();

  return (
    <header className={styles.topBar} data-testid="top-bar">
      <div className={styles.headerRow}>
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
        <div className={styles.controls}>
          <SearchInput value={state.searchTerm} />
          <FilterControls activeFilter={state.activeFilter} />

          <div className={styles.actionsGroup}>
            <SelectionModeToggle enabled={state.isSelectionMode} />

            {!state.isSelectionMode ? (
              <Button
                className={styles.createColumnButton}
                data-testid="topbar-create-column-button"
                onClick={createColumn}
              >
                New column
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
