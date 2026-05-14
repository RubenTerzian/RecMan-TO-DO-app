import type {
  FocusEventHandler,
  KeyboardEventHandler,
  PointerEventHandler,
  SubmitEventHandler,
} from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

type UseInlineTitleEditorFormOptions = {
  /** "create" leaves the input empty; "edit" auto-selects the seeded title. */
  mode: "create" | "edit";
  /**
   * Receives the final input value when the form is submitted. The
   * editor reads its own value from the DOM, so this fires once per
   * save — never per keystroke.
   */
  onSave(title: string): void;
  /**
   * Called when the user explicitly cancels (Escape key, cancel
   * button) or when focus leaves the entire form surface.
   */
  onCancel(): void;
};

/**
 * Shared behavior for the inline title editors used by columns and
 * tasks. Owns:
 *  - the uncontrolled input ref + auto-select on edit-mode mount
 *  - submit handler that reads the DOM value and forwards to onSave
 *  - focus-safe blur (only cancels when focus leaves the form)
 *  - Escape key cancel
 *  - pointerdown preventDefault for action buttons so they don't
 *    steal focus from the input mid-blur (which would otherwise
 *    collapse the editor before onClick fires)
 */
export function useInlineTitleEditorForm({
  mode,
  onSave,
  onCancel,
}: UseInlineTitleEditorFormOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isCreateMode = mode === "create";

  // In edit mode, pre-select the existing title so the user can
  // immediately type to overwrite it.
  useLayoutEffect(() => {
    if (isCreateMode || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isCreateMode]);

  const handleSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (event) => {
      event.preventDefault();
      onSave(inputRef.current?.value ?? "");
    },
    [onSave],
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLFormElement>>(
    (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) {
        return;
      }
      if (
        next === null &&
        document.activeElement instanceof Node &&
        event.currentTarget.contains(document.activeElement)
      ) {
        return;
      }
      onCancel();
    },
    [onCancel],
  );

  const handleInputKeyDown = useCallback<
    KeyboardEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    },
    [onCancel],
  );

  const handleActionPointerDown = useCallback<
    PointerEventHandler<HTMLButtonElement>
  >((event) => {
    event.preventDefault();
  }, []);

  return {
    inputRef,
    isCreateMode,
    handleSubmit,
    handleBlur,
    handleInputKeyDown,
    handleActionPointerDown,
  };
}
