import type { StoreState } from "./types";

export const APP_STORAGE_KEY = "recman-todo:v1";

export type PersistedStoreState = Pick<StoreState, "columns" | "tasks">;

export function loadStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(APP_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as PersistedStoreState;
  } catch {
    return null;
  }
}

export function saveStoredState(state: PersistedStoreState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}
