import { useCallback } from "react";
import { useDraftSession } from "@/hooks/useDraftSession";
import { useEditorBlur } from "@/hooks/useEditorBlur";
import { useStore } from "@/store/store";
import { selectCreateColumn } from "@/store/selectors";

const DEFAULT_COLUMN_TITLE = "New Column";

function normalizeColumnTitle(title: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || DEFAULT_COLUMN_TITLE;
}

export function useColumnCreation() {
  const createColumn = useStore(selectCreateColumn);
  const { draft, isActive, resetSession, startSession, updateDraft } =
    useDraftSession(DEFAULT_COLUMN_TITLE);

  const handleStartColumnCreation = useCallback(() => {
    startSession(DEFAULT_COLUMN_TITLE);
  }, [startSession]);

  const handleCreateEditorBlur = useEditorBlur(resetSession);

  const handleSaveColumnCreation = useCallback(() => {
    createColumn(normalizeColumnTitle(draft));
    resetSession();
  }, [createColumn, draft, resetSession]);

  return {
    draftTitle: draft,
    isCreatingColumn: isActive,
    handleCreateEditorBlur,
    handleDraftTitleChange: updateDraft,
    handleCancelColumnCreation: resetSession,
    handleSaveColumnCreation,
    handleStartColumnCreation,
  };
}
