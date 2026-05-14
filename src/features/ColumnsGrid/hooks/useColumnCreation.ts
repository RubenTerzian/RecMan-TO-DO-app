import { useStore } from "@/store/store";
import { selectCreateColumn } from "@/store/selectors";
import { useInlineEditorGate } from "@/hooks/useInlineEditorGate";

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
    emptyValueBehavior: "keep-open",
  });

  return {
    isCreatingColumn: isOpen,
    handleStartColumnCreation: start,
    handleCancelColumnCreation: cancel,
    handleSaveColumnCreation: save,
  };
}
