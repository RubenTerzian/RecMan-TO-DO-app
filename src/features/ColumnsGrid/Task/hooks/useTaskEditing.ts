import { useCallback } from "react";
import { useDraftSession } from "@/hooks/useDraftSession";
import { useEditorBlur } from "@/hooks/useEditorBlur";
import { useStore } from "@/store/store";
import { selectDeleteTask, selectUpdateTaskTitle } from "@/store/selectors";

function normalizeTaskTitle(title: string, fallbackTitle: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || fallbackTitle;
}

type UseTaskEditingOptions = {
  taskId: string;
  title: string;
};

export function useTaskEditing({ taskId, title }: UseTaskEditingOptions) {
  const updateTaskTitle = useStore(selectUpdateTaskTitle);
  const deleteTask = useStore(selectDeleteTask);
  const { draft, isActive, resetSession, startSession, updateDraft } =
    useDraftSession("");

  const handleStartEditing = useCallback(() => {
    startSession(title);
  }, [startSession, title]);

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      updateDraft(nextTitle);
    },
    [updateDraft],
  );

  const handleCancelEditing = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleEditorBlur = useEditorBlur(handleCancelEditing);

  const handleSaveEditing = useCallback(() => {
    updateTaskTitle(taskId, normalizeTaskTitle(draft, title));
    resetSession();
  }, [draft, resetSession, taskId, title, updateTaskTitle]);

  const handleDeleteTask = useCallback(() => {
    deleteTask(taskId);
  }, [deleteTask, taskId]);

  return {
    draftTitle: draft,
    isEditing: isActive,
    handleCancelEditing,
    handleDeleteTask,
    handleEditorBlur,
    handleSaveEditing,
    handleStartEditing,
    handleTitleChange,
  };
}
