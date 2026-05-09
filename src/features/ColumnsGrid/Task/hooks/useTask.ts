import { useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import {
  makeSelectIsTaskSelected,
  makeSelectTaskById,
  selectToggleTaskCompletion,
  selectToggleTaskSelection,
} from "@/store/selectors";

type UseTaskOptions = {
  taskId: string;
  mode: "default" | "selection";
};

export function useTask({ taskId, mode }: UseTaskOptions) {
  const selectTask = useMemo(() => makeSelectTaskById(taskId), [taskId]);
  const selectIsSelected = useMemo(
    () => makeSelectIsTaskSelected(taskId),
    [taskId],
  );

  const task = useStore(selectTask);
  const isSelected = useStore(selectIsSelected);
  const toggleTaskCompletion = useStore(selectToggleTaskCompletion);
  const toggleTaskSelection = useStore(selectToggleTaskSelection);

  const selectionMode = mode === "selection";

  const handleToggle = useCallback(() => {
    if (selectionMode) {
      toggleTaskSelection(taskId);

      return;
    }

    toggleTaskCompletion(taskId);
  }, [selectionMode, taskId, toggleTaskCompletion, toggleTaskSelection]);

  return {
    task,
    selectionMode,
    isSelected,
    isComplete: task?.isComplete ?? false,
    handleToggle,
  };
}
