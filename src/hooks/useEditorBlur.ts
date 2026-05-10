import type { FocusEventHandler } from "react";
import { useCallback } from "react";

export function useEditorBlur(onBlurOutside: () => void) {
  return useCallback<FocusEventHandler<HTMLFormElement>>(
    (event) => {
      const nextFocusedElement = event.relatedTarget;

      if (
        nextFocusedElement instanceof Node &&
        event.currentTarget.contains(nextFocusedElement)
      ) {
        return;
      }

      onBlurOutside();
    },
    [onBlurOutside],
  );
}
