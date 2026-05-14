import { useCallback } from "react";
import { useStore } from "@/store/store";
import { selectCreateTask } from "@/store/selectors";
import { useInlineEditorGate } from "@/hooks/useInlineEditorGate";

type UseColumnTaskCreationOptions = {
  columnId: string;
};

/**
 * Owns the open/closed flag for a column's task-creation editor. The
 * editor is uncontrolled — keystrokes never reach this hook.
 */
export function useColumnTaskCreation({
  columnId,
}: UseColumnTaskCreationOptions) {
  const createTask = useStore(selectCreateTask);

  const handleCommit = useCallback(
    (title: string) => createTask(columnId, title),
    [columnId, createTask],
  );

  const { isOpen, start, cancel, save } = useInlineEditorGate({
    onCommit: handleCommit,
    emptyValueBehavior: "keep-open",
  });

  return {
    isCreatingTask: isOpen,
    handleStartTaskCreation: start,
    handleCancelTaskCreation: cancel,
    handleSaveTaskCreation: save,
  };
}
