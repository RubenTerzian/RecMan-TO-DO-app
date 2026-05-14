/**
 * Generic ghost-pointer store factory.
 *
 * The drag ghost (TaskDragGhost / ColumnDragGhost) follows the cursor
 * by mutating its own DOM transform, never re-rendering React. To do
 * that it needs an external store of the current pointer position
 * with a subscription API.
 *
 * Both task and column DnD hooks need the exact same shape, so this
 * factory replaces what used to be two near-identical hand-rolled
 * stores. Callers get a typed `getSnapshot` / `subscribe` /
 * `setPointer` triple plus a `reset` helper.
 */

type GhostPointer = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
};

const INACTIVE_POINTER: GhostPointer = {
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  active: false,
};

export type GhostPointerStore = {
  getSnapshot(): GhostPointer;
  subscribe(listener: () => void): () => void;
  setPointer(next: Partial<GhostPointer>): void;
  reset(): void;
};

export function createGhostPointerStore(): GhostPointerStore {
  const state: GhostPointer = { ...INACTIVE_POINTER };
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setPointer(next) {
      Object.assign(state, next);
      notify();
    },
    reset() {
      Object.assign(state, INACTIVE_POINTER);
      notify();
    },
  };
}
