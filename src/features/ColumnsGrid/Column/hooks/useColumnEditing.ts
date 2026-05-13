import { useCallback } from "react";
import { useDraftSession } from "@/hooks/useDraftSession";
import { useEditorBlur } from "@/hooks/useEditorBlur";
import { useStore } from "@/store/store";
import { selectDeleteColumn, selectUpdateColumnTitle } from "@/store/selectors";

type UseColumnEditingOptions = {
  columnId: string;
  title: string;
};

function normalizeColumnTitle(title: string, fallbackTitle: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || fallbackTitle;
}

export function useColumnEditing({ columnId, title }: UseColumnEditingOptions) {
  const updateColumnTitle = useStore(selectUpdateColumnTitle);
  const deleteColumn = useStore(selectDeleteColumn);
  const { draft, isActive, resetSession, startSession, updateDraft } =
    useDraftSession("");

  const handleStartEditing = useCallback(() => {
    startSession(title);
  }, [startSession, title]);

  const handleEditorBlur = useEditorBlur(resetSession);

  const handleSaveEditing = useCallback(() => {
    updateColumnTitle(columnId, normalizeColumnTitle(draft, title));
    resetSession();
  }, [columnId, draft, resetSession, title, updateColumnTitle]);

  const handleDeleteColumn = useCallback(() => {
    deleteColumn(columnId);
  }, [columnId, deleteColumn]);

  return {
    draftTitle: draft,
    isEditing: isActive,
    handleCancelEditing: resetSession,
    handleDeleteColumn,
    handleDraftTitleChange: updateDraft,
    handleEditorBlur,
    handleSaveEditing,
    handleStartEditing,
  };
}
