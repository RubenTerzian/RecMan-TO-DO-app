import type { FocusEventHandler } from "react";
import { useCallback } from "react";

export function useEditorBlur(onBlurOutside: () => void) {
  return useCallback<FocusEventHandler<HTMLFormElement>>(
    (event) => {
      const nextFocusedElement = event.relatedTarget;
      const activeElement = document.activeElement;

      if (
        nextFocusedElement instanceof Node &&
        event.currentTarget.contains(nextFocusedElement)
      ) {
        return;
      }

      if (
        nextFocusedElement === null &&
        activeElement instanceof Node &&
        event.currentTarget.contains(activeElement)
      ) {
        return;
      }

      onBlurOutside();
    },
    [onBlurOutside],
  );
}
