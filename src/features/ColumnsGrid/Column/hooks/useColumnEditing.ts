import { useCallback } from "react";
import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useStore } from "@/store/store";
import { selectDeleteColumn, selectUpdateColumnTitle } from "@/store/selectors";

type UseColumnEditingOptions = {
  columnId: string;
  title: string;
};

export function useColumnEditing({ columnId, title }: UseColumnEditingOptions) {
  const updateColumnTitle = useStore(selectUpdateColumnTitle);
  const deleteColumn = useStore(selectDeleteColumn);

  const editor = useInlineEditor<string>({
    initialDraft: title,
    emptyDraft: "",
    normalize: (draft) => draft.trim() || title,
    onCommit: (nextTitle) => updateColumnTitle(columnId, nextTitle),
  });

  const handleDeleteColumn = useCallback(() => {
    deleteColumn(columnId);
  }, [columnId, deleteColumn]);

  return {
    draftTitle: editor.draft,
    isEditing: editor.isActive,
    handleCancelEditing: editor.cancel,
    handleDeleteColumn,
    handleDraftTitleChange: editor.update,
    handleEditorBlur: editor.handleBlur,
    handleSaveEditing: editor.save,
    handleStartEditing: editor.start,
  };
}
