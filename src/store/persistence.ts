import type { StoreState } from "./types";

export const BOARD_STORAGE_KEY = "recman-todo-board:v1";

export function loadBoardState() {
  return null as StoreState | null;
}

export function saveBoardState(state: StoreState) {
  void state;
}
