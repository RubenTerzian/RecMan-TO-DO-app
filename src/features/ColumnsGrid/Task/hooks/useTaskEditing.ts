import { useCallback } from "react";
import { useStore } from "@/store/store";
import { selectDeleteTask, selectUpdateTaskTitle } from "@/store/selectors";
import { useInlineEditorGate } from "@/hooks/useInlineEditorGate";

type UseTaskEditingOptions = {
  taskId: string;
  title: string;
};

/**
 * Owns the open/closed flag for inline task-title editing. The
 * editor is uncontrolled — keystrokes never reach this hook.
 */
export function useTaskEditing({ taskId, title }: UseTaskEditingOptions) {
  const updateTaskTitle = useStore(selectUpdateTaskTitle);
  const deleteTask = useStore(selectDeleteTask);

  const handleCommit = useCallback(
    (nextTitle: string) => updateTaskTitle(taskId, nextTitle),
    [taskId, updateTaskTitle],
  );

  const { isOpen, start, cancel, save } = useInlineEditorGate({
    onCommit: handleCommit,
    fallbackTitle: title,
  });

  const handleDeleteTask = useCallback(() => {
    deleteTask(taskId);
  }, [deleteTask, taskId]);

  return {
    isEditing: isOpen,
    initialTitle: title,
    handleCancelEditing: cancel,
    handleDeleteTask,
    handleSaveEditing: save,
    handleStartEditing: start,
  };
}
