import { useStore } from "@/store/store";
import { selectCreateColumn } from "@/store/selectors";
import { useInlineEditorGate } from "@/hooks/useInlineEditorGate";

const DEFAULT_COLUMN_TITLE = "New Column";

/**
 * Owns the open/closed flag for the trailing column-creation editor.
 * The editor itself is uncontrolled, so this hook (and any component
 * subscribed to it) only re-renders on open / close / commit, not on
 * keystrokes.
 */
export function useColumnCreation() {
  const createColumn = useStore(selectCreateColumn);

  const { isOpen, start, cancel, save } = useInlineEditorGate({
    onCommit: createColumn,
    fallbackTitle: DEFAULT_COLUMN_TITLE,
  });

  return {
    isCreatingColumn: isOpen,
    defaultTitle: DEFAULT_COLUMN_TITLE,
    handleStartColumnCreation: start,
    handleCancelColumnCreation: cancel,
    handleSaveColumnCreation: save,
  };
}
