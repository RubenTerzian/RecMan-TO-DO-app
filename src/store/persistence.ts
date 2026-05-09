import type { StoreState } from "./types";

export const APP_STORAGE_KEY = "recman-todo:v1";

export function loadStoredState() {
  return null as StoreState | null;
}

export function saveStoredState(state: StoreState) {
  void state;
}
