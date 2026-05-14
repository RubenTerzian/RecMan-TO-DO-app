import { useCallback } from "react";
import { useStore } from "@/store/store";
import { selectDeleteColumn, selectUpdateColumnTitle } from "@/store/selectors";
import { useInlineEditorGate } from "@/hooks/useInlineEditorGate";

type UseColumnEditingOptions = {
  columnId: string;
  title: string;
};

/**
 * Owns the open/closed flag for inline column-title editing. The
 * editor is uncontrolled — keystrokes never reach this hook.
 */
export function useColumnEditing({ columnId, title }: UseColumnEditingOptions) {
  const updateColumnTitle = useStore(selectUpdateColumnTitle);
  const deleteColumn = useStore(selectDeleteColumn);

  const handleCommit = useCallback(
    (nextTitle: string) => updateColumnTitle(columnId, nextTitle),
    [columnId, updateColumnTitle],
  );

  const { isOpen, start, cancel, save } = useInlineEditorGate({
    onCommit: handleCommit,
    emptyValueBehavior: "keep-open",
  });

  const handleDeleteColumn = useCallback(() => {
    deleteColumn(columnId);
  }, [columnId, deleteColumn]);

  return {
    isEditing: isOpen,
    initialTitle: title,
    handleCancelEditing: cancel,
    handleDeleteColumn,
    handleSaveEditing: save,
    handleStartEditing: start,
  };
}
