import { useCallback } from "react";
import { useDraftSession } from "@/hooks/useDraftSession";
import { useEditorBlur } from "@/hooks/useEditorBlur";
import { useStore } from "@/store/store";
import { selectCreateTask } from "@/store/selectors";

const DEFAULT_TASK_TITLE = "New Task";

function normalizeTaskTitle(title: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || DEFAULT_TASK_TITLE;
}

type UseColumnTaskCreationOptions = {
  columnId: string;
};

export function useColumnTaskCreation({
  columnId,
}: UseColumnTaskCreationOptions) {
  const createTask = useStore(selectCreateTask);
  const { draft, isActive, resetSession, startSession, updateDraft } =
    useDraftSession(DEFAULT_TASK_TITLE);

  const handleStartTaskCreation = useCallback(() => {
    startSession(DEFAULT_TASK_TITLE);
  }, [startSession]);

  const handleTaskEditorBlur = useEditorBlur(resetSession);

  const handleSaveTaskCreation = useCallback(() => {
    createTask(columnId, normalizeTaskTitle(draft));
    resetSession();
  }, [columnId, createTask, draft, resetSession]);

  return {
    draftTaskTitle: draft,
    isCreatingTask: isActive,
    handleCancelTaskCreation: resetSession,
    handleSaveTaskCreation,
    handleStartTaskCreation,
    handleTaskEditorBlur,
    handleTaskTitleChange: updateDraft,
  };
}
