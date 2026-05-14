import type { FocusEventHandler } from "react";
import { useCallback, useState } from "react";

type UseInlineEditorOptions<TDraft> = {
  /**
   * Draft seed used when the editor opens. Re-evaluated on each call to
   * `start()`, so passing the latest persisted value is correct.
   */
  initialDraft: TDraft;
  /**
   * Placeholder draft used while the editor is closed. Defaults to
   * `initialDraft`; pass an empty value (e.g. `""`) when the closed
   * state should not hold the entity's current data.
   */
  emptyDraft?: TDraft;
  /** Optional pre-commit normalization (trim + fallback, etc.). */
  normalize?(draft: TDraft): TDraft;
  /** Called with the normalized draft when the user saves. */
  onCommit(draft: TDraft): void;
};

type SessionState<TDraft> = {
  draft: TDraft;
  isActive: boolean;
};

/**
 * Standardised inline-editor state machine.
 *
 * Owns the local draft + open/closed flag, the focus-safe blur-to-cancel
 * handler, and the start/save/cancel choreography. Replaces the four
 * near-identical implementations that previously lived in
 * `useColumnEditing`, `useColumnCreation`, `useColumnTaskCreation`,
 * and `useTaskEditing`, and the two helper hooks they all depended on
 * (`useDraftSession`, `useEditorBlur`).
 *
 * The returned shape is generic on purpose — call sites destructure
 * with their own domain names so existing components keep their
 * intention-revealing prop names (`isEditing`, `isCreatingTask`, etc.).
 */
export function useInlineEditor<TDraft>({
  initialDraft,
  emptyDraft,
  normalize,
  onCommit,
}: UseInlineEditorOptions<TDraft>) {
  const closedDraft = emptyDraft ?? initialDraft;
  const [session, setSession] = useState<SessionState<TDraft>>({
    draft: closedDraft,
    isActive: false,
  });

  const cancel = useCallback(() => {
    setSession((current) =>
      Object.is(current.draft, closedDraft) && !current.isActive
        ? current
        : { draft: closedDraft, isActive: false },
    );
  }, [closedDraft]);

  const start = useCallback(() => {
    setSession((current) =>
      current.isActive && Object.is(current.draft, initialDraft)
        ? current
        : { draft: initialDraft, isActive: true },
    );
  }, [initialDraft]);

  const update = useCallback((draft: TDraft) => {
    setSession((current) =>
      Object.is(current.draft, draft) ? current : { ...current, draft },
    );
  }, []);

  const save = useCallback(() => {
    onCommit(normalize ? normalize(session.draft) : session.draft);
    setSession({ draft: closedDraft, isActive: false });
  }, [closedDraft, normalize, onCommit, session.draft]);

  /**
   * Focus-safe blur handler for an editor form. Cancels the editor
   * only when focus has truly left the editor surface — focus shifts
   * to a child input/button do not collapse the editor.
   */
  const handleBlur = useCallback<FocusEventHandler<HTMLFormElement>>(
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

      cancel();
    },
    [cancel],
  );

  return {
    draft: session.draft,
    isActive: session.isActive,
    start,
    save,
    cancel,
    update,
    handleBlur,
  };
}
