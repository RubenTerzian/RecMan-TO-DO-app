import { useState } from "react";
import styles from "./AppShell.module.css";
import {
  DEFAULT_MOCK_SCREEN,
  getMockScreen,
  type MockScreenId,
} from "./mockScreens";
import { TopBar } from "@/features/TopBar/components/TopBar/index";
import { BoardShell } from "@/features/Board/components/BoardShell/index";

export default function App() {
  const [activeScreen, setActiveScreen] =
    useState<MockScreenId>(DEFAULT_MOCK_SCREEN);
  const screen = getMockScreen(activeScreen);

  return (
    <div className={styles.appShell} data-testid="app-shell">
      <div className={styles.appFrame}>
        <TopBar
          activeScreen={activeScreen}
          screenLabel={screen.label}
          state={screen.topBar}
          onScreenChange={setActiveScreen}
        />
        <BoardShell board={screen.board} />
      </div>
    </div>
  );
}
