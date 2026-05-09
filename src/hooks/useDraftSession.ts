import { useCallback, useState } from "react";

type DraftSessionState<TDraft> = {
  draft: TDraft;
  isActive: boolean;
};

export function useDraftSession<TDraft>(inactiveDraft: TDraft) {
  const [sessionState, setSessionState] = useState<DraftSessionState<TDraft>>({
    draft: inactiveDraft,
    isActive: false,
  });

  const resetSession = useCallback(() => {
    setSessionState((currentState) => {
      if (
        Object.is(currentState.draft, inactiveDraft) &&
        !currentState.isActive
      ) {
        return currentState;
      }

      return {
        draft: inactiveDraft,
        isActive: false,
      };
    });
  }, [inactiveDraft]);

  const startSession = useCallback((draft: TDraft) => {
    setSessionState((currentState) => {
      if (currentState.isActive && Object.is(currentState.draft, draft)) {
        return currentState;
      }

      return {
        draft,
        isActive: true,
      };
    });
  }, []);

  const updateDraft = useCallback((draft: TDraft) => {
    setSessionState((currentState) => {
      if (Object.is(currentState.draft, draft)) {
        return currentState;
      }

      return {
        ...currentState,
        draft,
      };
    });
  }, []);

  return {
    draft: sessionState.draft,
    isActive: sessionState.isActive,
    resetSession,
    startSession,
    updateDraft,
  };
}
