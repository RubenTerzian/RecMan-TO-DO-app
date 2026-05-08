import type { BoardState } from "./types";

export const BOARD_STORAGE_KEY = "recman-todo-board:v1";

export function loadBoardState() {
  return null as BoardState | null;
}

export function saveBoardState(state: BoardState) {
  void state;
}
