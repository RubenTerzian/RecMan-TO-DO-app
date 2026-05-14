import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useStore } from "@/store/store";
import { selectCreateColumn } from "@/store/selectors";

const DEFAULT_COLUMN_TITLE = "New Column";

export function useColumnCreation() {
  const createColumn = useStore(selectCreateColumn);

  const editor = useInlineEditor<string>({
    initialDraft: DEFAULT_COLUMN_TITLE,
    normalize: (draft) => draft.trim() || DEFAULT_COLUMN_TITLE,
    onCommit: createColumn,
  });

  return {
    draftTitle: editor.draft,
    isCreatingColumn: editor.isActive,
    handleCreateEditorBlur: editor.handleBlur,
    handleDraftTitleChange: editor.update,
    handleCancelColumnCreation: editor.cancel,
    handleSaveColumnCreation: editor.save,
    handleStartColumnCreation: editor.start,
  };
}
