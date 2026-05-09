import { useCallback, useState } from "react";
import { useStore } from "@/store/store";
import { selectCreateTask } from "@/store/selectors";

const DEFAULT_TASK_TITLE = "New Task";

type TaskCreationState = {
  title: string;
  isCreatingTask: boolean;
};

const DEFAULT_TASK_CREATION_STATE: TaskCreationState = {
  title: DEFAULT_TASK_TITLE,
  isCreatingTask: false,
};

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
  const [creationState, setCreationState] = useState<TaskCreationState>(
    DEFAULT_TASK_CREATION_STATE,
  );

  const resetCreationState = useCallback(() => {
    setCreationState((currentState) => {
      if (
        currentState.title === DEFAULT_TASK_CREATION_STATE.title &&
        currentState.isCreatingTask ===
          DEFAULT_TASK_CREATION_STATE.isCreatingTask
      ) {
        return currentState;
      }

      return DEFAULT_TASK_CREATION_STATE;
    });
  }, []);

  const handleStartTaskCreation = useCallback(() => {
    setCreationState((currentState) => {
      if (
        currentState.title === DEFAULT_TASK_TITLE &&
        currentState.isCreatingTask
      ) {
        return currentState;
      }

      return {
        title: DEFAULT_TASK_TITLE,
        isCreatingTask: true,
      };
    });
  }, []);

  const handleTaskTitleChange = useCallback((title: string) => {
    setCreationState((currentState) => {
      if (currentState.title === title) {
        return currentState;
      }

      return {
        ...currentState,
        title,
      };
    });
  }, []);

  const handleCancelTaskCreation = useCallback(() => {
    resetCreationState();
  }, [resetCreationState]);

  const handleSaveTaskCreation = useCallback(() => {
    createTask(columnId, normalizeTaskTitle(creationState.title));
    resetCreationState();
  }, [columnId, createTask, creationState.title, resetCreationState]);

  return {
    draftTaskTitle: creationState.title,
    isCreatingTask: creationState.isCreatingTask,
    handleCancelTaskCreation,
    handleSaveTaskCreation,
    handleStartTaskCreation,
    handleTaskTitleChange,
  };
}
