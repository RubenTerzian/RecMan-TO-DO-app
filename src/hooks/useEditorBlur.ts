import type { FocusEventHandler } from "react";
import { useCallback } from "react";

export function useEditorBlur(onBlurOutside: () => void) {
  return useCallback<FocusEventHandler<HTMLFormElement>>(
    (event) => {
      const currentTarget = event.currentTarget;
      const nextFocusedElement = event.relatedTarget;

      queueMicrotask(() => {
        if (
          nextFocusedElement instanceof Node &&
          currentTarget.contains(nextFocusedElement)
        ) {
          return;
        }

        if (!nextFocusedElement) {
          const activeElement = document.activeElement;

          if (
            activeElement instanceof Node &&
            currentTarget.contains(activeElement)
          ) {
            return;
          }
        }

        onBlurOutside();
      });
    },
    [onBlurOutside],
  );
}
