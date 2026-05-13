/**
 * Shared pointer-based drag activation helpers used by both task and
 * column drag-and-drop hooks.
 *
 * Activation policy:
 * - Mouse / pen: drag activates after the pointer moves
 *   `MOUSE_ACTIVATION_PIXELS` pixels. Drag may start from any non-interactive
 *   area inside the registered handle element.
 * - Touch: drag activates only after a long-press of `TOUCH_LONG_PRESS_MS`
 *   without significant movement. The pointer must land directly on a
 *   `[data-drag-handle="true"]` element. Any pre-activation movement
 *   exceeding `TOUCH_PRE_ACTIVATION_CANCEL_PIXELS` cancels the drag and
 *   lets the browser scroll naturally — preventing the "stuck in DnD
 *   while trying to scroll" state on mobile.
 */

export const MOUSE_ACTIVATION_PIXELS = 6;
export const TOUCH_LONG_PRESS_MS = 280;
export const TOUCH_PRE_ACTIVATION_CANCEL_PIXELS = 8;

const INTERACTIVE_SELECTOR =
  'button, input, textarea, select, option, a, label, [role="button"], [contenteditable="true"], [data-no-drag="true"]';

const DRAG_HANDLE_SELECTOR = '[data-drag-handle="true"]';

/**
 * Returns true when a mouse/pen pointerdown should NOT initiate a drag,
 * because the user clicked an interactive child of the handle that is
 * not itself the drag handle (e.g. a button inside the column header).
 */
export function shouldIgnoreMousePointerDown(
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
 * Returns true when a touch pointerdown landed directly on a drag-handle
 * descendant of the registered handle element. Touch DnD is restricted
 * to explicit handles so the rest of the surface stays scrollable.
 */
export function isTouchOnDragHandle(
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
}
