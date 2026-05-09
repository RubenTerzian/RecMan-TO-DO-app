import { useCallback } from "react";
import { useStore } from "@/store/store";

type UseTaskOptions = {
  taskId: string;
  mode: "default" | "selection";
};

export function useTask({ taskId, mode }: UseTaskOptions) {
  const task = useStore(
    useCallback(
      (state) => state.tasks.find((currentTask) => currentTask.id === taskId),
      [taskId],
    ),
  );
  const isSelected = useStore(
    useCallback((state) => state.selectedTaskIds.includes(taskId), [taskId]),
  );
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);
  const toggleTaskSelection = useStore((state) => state.toggleTaskSelection);

  const selectionMode = mode === "selection";

  const handleToggle = () => {
    if (selectionMode) {
      toggleTaskSelection(taskId);

      return;
    }

    toggleTaskCompletion(taskId);
  };

  return {
    task,
    selectionMode,
    isSelected,
    isComplete: task?.isComplete ?? false,
    handleToggle,
  };
}
