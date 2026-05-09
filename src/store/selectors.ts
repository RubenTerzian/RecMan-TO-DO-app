import type { StoreState } from "./types";

export function selectColumnCount(state: StoreState) {
  return state.columns.length;
}
