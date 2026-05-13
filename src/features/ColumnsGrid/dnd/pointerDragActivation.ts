/**
 * Shared pointer-based drag activation helpers used by both task and
 * column drag-and-drop hooks.
 *
 * Activation policy:
 * - Mouse / pen: drag activates after the pointer moves
 *   `MOUSE_ACTIVATION_PIXELS` pixels from the registered handle. The
 *   entire handle surface is draggable, except interactive children
 *   (buttons, inputs, links, etc.).
 * - Touch: drag activates only after a long-press of
 *   `TOUCH_LONG_PRESS_MS` without significant movement, anywhere on the
 *   handle surface. Any pre-activation movement exceeding
 *   `TOUCH_PRE_ACTIVATION_CANCEL_PIXELS` cancels the long-press timer
 *   and lets the browser scroll naturally — preventing the "stuck in
 *   DnD while trying to scroll" state on mobile.
 */

export const MOUSE_ACTIVATION_PIXELS = 6;
export const TOUCH_LONG_PRESS_MS = 280;
export const TOUCH_PRE_ACTIVATION_CANCEL_PIXELS = 8;

const INTERACTIVE_SELECTOR =
  'button, input, textarea, select, option, a, label, [role="button"], [contenteditable="true"], [data-no-drag="true"]';

const DRAG_HANDLE_SELECTOR = '[data-drag-handle="true"]';

/**
 * Returns true when a pointerdown should NOT initiate a drag, because
 * the user pressed an interactive child of the handle that is not
 * itself the drag handle (e.g. an icon button inside the column header).
 */
export function shouldIgnoreDragStart(
  target: EventTarget | null,
  handleElement: HTMLElement,
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactiveElement = target.closest(INTERACTIVE_SELECTOR);

  if (!interactiveElement || !handleElement.contains(interactiveElement)) {
    return false;
  }

  return interactiveElement.getAttribute("data-drag-handle") !== "true";
}

/**
 * Returns true when the pointerdown landed on a `[data-drag-handle]`
 * descendant. We use this to decide whether to `preventDefault()` on
 * the initial touch event — only handles set `touch-action: none` and
 * are safe to consume. On the rest of the surface we must let the
 * browser keep handling the touch so it can still scroll.
 */
export function isPointerOnDragHandle(
  target: EventTarget | null,
  handleElement: HTMLElement,
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const handle = target.closest(DRAG_HANDLE_SELECTOR);

  return !!handle && handleElement.contains(handle);
}

export function setDraggingDocumentState(isDragging: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.cursor = isDragging ? "grabbing" : "";
  document.body.style.userSelect = isDragging ? "none" : "";
  // Block the browser from interpreting touch gestures as page
  // scroll/zoom/pan while a drag is active. Without this iOS Safari
  // and Android Chrome continue to scroll the page during the drag
  // because the gesture was already routed to a scroller before the
  // long-press fired. Combined with the non-passive `touchmove`
  // listener attached by `createPointerDragSession`, this fully
  // suppresses native scrolling while DnD is in progress.
  document.body.style.touchAction = isDragging ? "none" : "";
  document.documentElement.style.touchAction = isDragging ? "none" : "";
}
