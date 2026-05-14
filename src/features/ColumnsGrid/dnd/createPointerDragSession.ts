import {
  MOUSE_ACTIVATION_PIXELS,
  TOUCH_LONG_PRESS_MS,
  TOUCH_PRE_ACTIVATION_CANCEL_PIXELS,
  isPointerOnDragHandle,
  setDraggingDocumentState,
  shouldIgnoreDragStart,
} from "./pointerDragActivation";

/**
 * Pointer-driven drag session shared by the task and column DnD hooks.
 *
 * The hook author provides a `DragSessionDescriptor` that says how to
 * start, update, finalize and clean up a single drag. This module owns
 * everything else: activation policy (mouse vs. touch), pointer capture,
 * window listener wiring, OS callout suppression, document body lock,
 * and (critically) the non-passive `touchmove.preventDefault` that
 * stops iOS / Android from scrolling the page mid-drag.
 *
 * Splitting this out keeps both DnD hooks focused on their domain
 * (computing drop targets, mutating the store) instead of re-deriving
 * the same low-level event plumbing.
 */
export type DragSessionDescriptor = {
  /**
   * Element registered as the drag handle / surface. Pointer capture
   * targets this element. Interactive descendants (buttons, inputs,
   * etc.) automatically opt out via `shouldIgnoreDragStart`.
   */
  handleElement: HTMLElement;
  /** Pointerdown that may initiate the drag. */
  pointerDownEvent: PointerEvent;
  /**
   * Optional gate evaluated synchronously on pointerdown. Return false
   * to bail out before any listeners are attached (e.g. when the board
   * is in selection mode and DnD should be disabled).
   */
  canStart?(): boolean;
  /**
   * Called once the activation policy has fired (mouse: small move;
   * touch: long-press without significant movement). Use this to take
   * a snapshot of the source element, populate the drag store, and
   * mount the floating ghost.
   */
  onActivate(context: { clientX: number; clientY: number }): void;
  /** Called for every move once the drag is active. */
  onMove(context: { clientX: number; clientY: number }): void;
  /**
   * Called when the user releases the pointer over a valid target.
   * Implementations should commit the drop here.
   */
  onCommit(context: { clientX: number; clientY: number }): void;
  /**
   * Always called last. Use this to reset any state owned by the hook
   * (drag store, ghost slot, pointer-position store).
   */
  onCleanup(): void;
};

/**
 * Begin a drag session. Safe to call from within a pointerdown handler.
 * No-op if `canStart` returns false or the event came from an
 * interactive descendant of the handle.
 */
export function createPointerDragSession(descriptor: DragSessionDescriptor) {
  const {
    handleElement,
    pointerDownEvent,
    canStart,
    onActivate,
    onMove,
    onCommit,
    onCleanup,
  } = descriptor;

  if (canStart && !canStart()) {
    return;
  }

  if (
    pointerDownEvent.pointerType === "mouse" &&
    pointerDownEvent.button !== 0
  ) {
    return;
  }

  if (shouldIgnoreDragStart(pointerDownEvent.target, handleElement)) {
    return;
  }

  const isTouch = pointerDownEvent.pointerType === "touch";
  const dragStartX = pointerDownEvent.clientX;
  const dragStartY = pointerDownEvent.clientY;
  const pointerId = pointerDownEvent.pointerId;

  let isActive = false;
  let touchActivationTimerId: number | null = null;

  // For mouse / pen we always preventDefault to avoid text selection
  // and the OS callout. For touch we only consume pointerdown when it
  // landed on a real `[data-drag-handle]` element (which sets
  // `touch-action: none`); on the rest of the surface we must leave
  // the gesture to the browser so it can still scroll if the user
  // moves before the long-press fires.
  if (
    !isTouch ||
    isPointerOnDragHandle(pointerDownEvent.target, handleElement)
  ) {
    pointerDownEvent.preventDefault();
  }

  const cancelTouchActivationTimer = () => {
    if (touchActivationTimerId !== null) {
      window.clearTimeout(touchActivationTimerId);
      touchActivationTimerId = null;
    }
  };

  const cleanup = () => {
    cancelTouchActivationTimer();

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    window.removeEventListener("contextmenu", handleContextMenu, true);
    window.removeEventListener("touchmove", handleTouchMove, {
      capture: false,
    } as EventListenerOptions);

    if (handleElement.hasPointerCapture?.(pointerId)) {
      handleElement.releasePointerCapture?.(pointerId);
    }

    setDraggingDocumentState(false);
    onCleanup();
  };

  // Capture-phase listener that beats the OS context menu / callout
  // for the duration of the gesture. Required on iOS Safari when the
  // user long-presses an area that contains text.
  const handleContextMenu = (event: Event) => {
    event.preventDefault();
  };

  // Non-passive touchmove that stops iOS / Android from scrolling the
  // page once the drag is active. pointermove.preventDefault alone is
  // not enough: the browser commits the underlying touch gesture to a
  // scroller before pointer events fire.
  const handleTouchMove = (event: TouchEvent) => {
    if (!isActive) {
      return;
    }

    event.preventDefault();
  };

  const activate = (clientX: number, clientY: number) => {
    if (isActive) {
      return;
    }

    isActive = true;
    setDraggingDocumentState(true);

    if (handleElement.hasPointerCapture?.(pointerId) === false) {
      handleElement.setPointerCapture?.(pointerId);
    }

    onActivate({ clientX, clientY });
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (!isActive) {
      const deltaX = event.clientX - dragStartX;
      const deltaY = event.clientY - dragStartY;
      const distance = Math.hypot(deltaX, deltaY);

      if (isTouch) {
        // Pre-activation movement on touch cancels the long-press and
        // lets the browser scroll naturally — preventing the user
        // from getting stuck in DnD when they meant to scroll.
        if (distance > TOUCH_PRE_ACTIVATION_CANCEL_PIXELS) {
          cleanup();
        }

        return;
      }

      if (distance < MOUSE_ACTIVATION_PIXELS) {
        return;
      }

      activate(event.clientX, event.clientY);
    }

    event.preventDefault();
    onMove({ clientX: event.clientX, clientY: event.clientY });
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (!isActive) {
      // Tap/click without activation — clean up listeners and exit.
      cleanup();
      return;
    }

    onMove({ clientX: event.clientX, clientY: event.clientY });
    onCommit({ clientX: event.clientX, clientY: event.clientY });
    cleanup();
  };

  const handlePointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    cleanup();
  };

  window.addEventListener("pointermove", handlePointerMove, {
    passive: false,
  });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("contextmenu", handleContextMenu, true);
  window.addEventListener("touchmove", handleTouchMove, { passive: false });

  if (isTouch) {
    touchActivationTimerId = window.setTimeout(() => {
      touchActivationTimerId = null;
      activate(dragStartX, dragStartY);
      onMove({ clientX: dragStartX, clientY: dragStartY });
    }, TOUCH_LONG_PRESS_MS);
  }
}
