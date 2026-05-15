/**
 * Generic external store for transient pointer-drag state.
 *
 * Drag state is intentionally **not** kept in the main Zustand store:
 * it changes ~60 times per second during a drag, must never be
 * persisted, and must never be observed by unrelated subscribers.
 *
 * Each drag store keeps a single immutable snapshot, a `Set` of
 * listeners, and a caller-supplied `equals` function so identical
 * pointer updates do not cause spurious re-renders. Consumers read
 * the snapshot via `useSyncExternalStore`.
 *
 * Derived projections (e.g. ghost geometry, drop placement) are
 * stored directly inside the snapshot so React subscribers receive
 * stable references without any module-level cache.
 */

export type DragStateStore<T> = {
  getSnapshot(): T;
  subscribe(listener: () => void): () => void;
  setState(next: T): void;
  reset(): void;
};

export function createDragStateStore<T>(
  initialState: T,
  equals: (a: T, b: T) => boolean,
): DragStateStore<T> {
  let state = initialState;
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
    setState(next) {
      if (equals(state, next)) {
        return;
      }
      state = next;
      notify();
    },
    reset() {
      if (equals(state, initialState)) {
        return;
      }
      state = initialState;
      notify();
    },
  };
}
