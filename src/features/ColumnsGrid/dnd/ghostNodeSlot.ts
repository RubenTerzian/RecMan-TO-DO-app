/**
 * Holds a cloned copy of the source DOM element while a drag is in
 * progress, so the floating ghost can mount a pixel-perfect replica
 * (including current visual state, completion styling, highlights,
 * etc.) instead of re-rendering a custom approximation.
 *
 * - `setGhostSourceNode(node)` is called once at drag activation with
 *   `sourceElement.cloneNode(true)`.
 * - The matching ghost component reads it on mount and `appendChild`s
 *   it inside the ghost wrapper.
 * - `clearGhostSourceNode()` is called when the drag ends.
 *
 * Two independent slots are kept so that task and column drags don't
 * stomp on each other (only one can be active at a time, but keeping
 * them separate makes the ownership clearer).
 */

type Listener = () => void;

function createNodeSlot() {
  let node: HTMLElement | null = null;
  const listeners = new Set<Listener>();

  return {
    get(): HTMLElement | null {
      return node;
    },
    set(next: HTMLElement | null) {
      if (node === next) {
        return;
      }

      node = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const taskGhostNodeSlot = createNodeSlot();
export const columnGhostNodeSlot = createNodeSlot();
