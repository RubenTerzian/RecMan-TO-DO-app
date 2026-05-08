import type { BoardState } from "./types";

export function selectColumnCount(state: BoardState) {
  return state.columns.length;
}
