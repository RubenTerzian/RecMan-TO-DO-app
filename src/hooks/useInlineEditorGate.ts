import { useCallback, useEffect, useRef, useState } from "react";

type UseInlineEditorGateOptions = {
  /**
   * Called with the trimmed, fallback-applied title when the user
   * commits the editor. Receives the final string only — there is
   * no per-keystroke notification to the parent.
   */
  onCommit(title: string): void;
  /** Trimmed empty drafts fall back to this string. */
  fallbackTitle?: string;
  /**
   * Controls what happens when the user tries to save an empty value.
   * - `fallback` (default): commit the fallback title and close.
   * - `keep-open`: ignore the save and keep the editor open.
   */
  emptyValueBehavior?: "fallback" | "keep-open";
};

/**
 * State machine for an inline title editor whose draft lives **inside
 * the editor** (uncontrolled `defaultValue`). The hook only tracks the
 * open/closed flag; keystrokes never reach this hook or any consumer
 * of it.
 *
 * The returned `save` is a stable callback that takes the final title
 * string from the editor's own form submit and forwards it to
 * `onCommit`. Because the hook exposes a stable API and only
 * re-renders on open/close/commit, components above the editor never
 * re-render on keystrokes.
 */
export function useInlineEditorGate({
  onCommit,
  fallbackTitle,
  emptyValueBehavior = "fallback",
}: UseInlineEditorGateOptions) {
  const [isOpen, setIsOpen] = useState(false);

  // Latest fallback / commit handler in refs so `save` keeps stable
  // identity even if these change per render.
  const fallbackRef = useRef<string | undefined>(fallbackTitle);
  const onCommitRef = useRef(onCommit);
  const emptyValueBehaviorRef = useRef(emptyValueBehavior);

  useEffect(() => {
    fallbackRef.current = fallbackTitle;
  }, [fallbackTitle]);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    emptyValueBehaviorRef.current = emptyValueBehavior;
  }, [emptyValueBehavior]);

  const start = useCallback(() => {
    setIsOpen(true);
  }, []);

  const cancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const save = useCallback((rawTitle: string) => {
    const trimmed = rawTitle.trim();

    if (trimmed.length === 0 && emptyValueBehaviorRef.current === "keep-open") {
      return;
    }

    const fallback = fallbackRef.current ?? "";
    onCommitRef.current(trimmed || fallback);
    setIsOpen(false);
  }, []);

  return { isOpen, start, cancel, save };
}
