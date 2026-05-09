import { useCallback, useState } from "react";
import { useStore } from "@/store/store";
import { selectDeleteTask, selectUpdateTaskTitle } from "@/store/selectors";

type TaskEditingState = {
  title: string;
  isEditing: boolean;
};

const DEFAULT_TASK_EDITING_STATE: TaskEditingState = {
  title: "",
  isEditing: false,
};

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
  const [editingState, setEditingState] = useState<TaskEditingState>(
    DEFAULT_TASK_EDITING_STATE,
  );

  const resetEditingState = useCallback(() => {
    setEditingState((currentState) => {
      if (
        currentState.title === DEFAULT_TASK_EDITING_STATE.title &&
        currentState.isEditing === DEFAULT_TASK_EDITING_STATE.isEditing
      ) {
        return currentState;
      }

      return DEFAULT_TASK_EDITING_STATE;
    });
  }, []);

  const handleStartEditing = useCallback(() => {
    setEditingState((currentState) => {
      if (currentState.isEditing && currentState.title === title) {
        return currentState;
      }

      return {
        title,
        isEditing: true,
      };
    });
  }, [title]);

  const handleTitleChange = useCallback((nextTitle: string) => {
    setEditingState((currentState) => {
      if (currentState.title === nextTitle) {
        return currentState;
      }

      return {
        ...currentState,
        title: nextTitle,
      };
    });
  }, []);

  const handleCancelEditing = useCallback(() => {
    resetEditingState();
  }, [resetEditingState]);

  const handleSaveEditing = useCallback(() => {
    updateTaskTitle(taskId, normalizeTaskTitle(editingState.title, title));
    resetEditingState();
  }, [editingState.title, resetEditingState, taskId, title, updateTaskTitle]);

  const handleDeleteTask = useCallback(() => {
    deleteTask(taskId);
  }, [deleteTask, taskId]);

  return {
    draftTitle: editingState.title,
    isEditing: editingState.isEditing,
    handleCancelEditing,
    handleDeleteTask,
    handleSaveEditing,
    handleStartEditing,
    handleTitleChange,
  };
}
