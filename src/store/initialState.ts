import { loadStoredState } from "./persistence";
import type { StoreState } from "./types";

const SEED_COLUMNS: StoreState["columns"] = [
  { id: "column-1", title: "New Applications" },
  { id: "column-2", title: "Phone Screen" },
  { id: "column-3", title: "Onsite Interviews" },
];

const SEED_TASKS: StoreState["tasks"] = [
  {
    id: "task-1",
    columnId: "column-1",
    title: "Maya Patel - Senior Recruiter",
    isComplete: false,
  },
  {
    id: "task-2",
    columnId: "column-2",
    title: "Jordan Lee - Customer Success Manager",
    isComplete: false,
  },
  {
    id: "task-3",
    columnId: "column-3",
    title: "Alex Chen - Product Designer",
    isComplete: true,
  },
];

/**
 * Pure factory for the store's initial state. Reads only from
 * `localStorage` (persisted columns/tasks) and falls back to seeds.
 * Does NOT read from `window.location` — URL hydration of search /
 * filter happens once at store-module load (see `store.ts`) so that
 * `resetStore()` cleanly returns to factory defaults instead of
 * snapping back to whatever query is currently in the URL.
 */
export function createInitialState(): StoreState {
  const persistedState = loadStoredState();

  return {
    columns: persistedState?.columns ?? SEED_COLUMNS,
    tasks: persistedState?.tasks ?? SEED_TASKS,
    selectedTaskIds: [],
    selectionMode: false,
    activeFilter: "all",
    searchTerm: "",
  };
}
