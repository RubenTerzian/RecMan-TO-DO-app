import { useCallback } from "react";
import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useStore } from "@/store/store";
import { selectDeleteTask, selectUpdateTaskTitle } from "@/store/selectors";

type UseTaskEditingOptions = {
  taskId: string;
  title: string;
};

export function useTaskEditing({ taskId, title }: UseTaskEditingOptions) {
  const updateTaskTitle = useStore(selectUpdateTaskTitle);
  const deleteTask = useStore(selectDeleteTask);

  const editor = useInlineEditor<string>({
    initialDraft: title,
    emptyDraft: "",
    normalize: (draft) => draft.trim() || title,
    onCommit: (nextTitle) => updateTaskTitle(taskId, nextTitle),
  });

  const handleDeleteTask = useCallback(() => {
    deleteTask(taskId);
  }, [deleteTask, taskId]);

  return {
    draftTitle: editor.draft,
    isEditing: editor.isActive,
    handleCancelEditing: editor.cancel,
    handleDeleteTask,
    handleEditorBlur: editor.handleBlur,
    handleSaveEditing: editor.save,
    handleStartEditing: editor.start,
    handleTitleChange: editor.update,
  };
}
