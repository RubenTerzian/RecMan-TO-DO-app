import { useCallback, useMemo } from "react";
import { useStore } from "@/store/store";
import {
  makeSelectIsTaskSelected,
  makeSelectTaskById,
  selectSearchTerm,
  selectToggleTaskCompletion,
  selectToggleTaskSelection,
} from "@/store/selectors";

type TaskTitleSegment = {
  text: string;
  isMatch: boolean;
};

function getTaskTitleSegments(title: string, searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return [{ text: title, isMatch: false }] satisfies TaskTitleSegment[];
  }

  const normalizedTitle = title.toLowerCase();
  const segments: TaskTitleSegment[] = [];
  let searchStartIndex = 0;

  while (searchStartIndex < title.length) {
    const matchIndex = normalizedTitle.indexOf(
      normalizedSearchTerm,
      searchStartIndex,
    );

    if (matchIndex < 0) {
      const trailingText = title.slice(searchStartIndex);

      if (trailingText) {
        segments.push({ text: trailingText, isMatch: false });
      }

      break;
    }

    const unmatchedText = title.slice(searchStartIndex, matchIndex);

    if (unmatchedText) {
      segments.push({ text: unmatchedText, isMatch: false });
    }

    const matchedText = title.slice(
      matchIndex,
      matchIndex + normalizedSearchTerm.length,
    );

    segments.push({ text: matchedText, isMatch: true });
    searchStartIndex = matchIndex + normalizedSearchTerm.length;
  }

  return segments;
}

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
  const searchTerm = useStore(selectSearchTerm);
  const toggleTaskCompletion = useStore(selectToggleTaskCompletion);
  const toggleTaskSelection = useStore(selectToggleTaskSelection);

  const selectionMode = mode === "selection";
  const titleSegments = useMemo(
    () => getTaskTitleSegments(task?.title ?? "", searchTerm),
    [searchTerm, task?.title],
  );

  const handleToggle = useCallback(() => {
    if (selectionMode) {
      toggleTaskSelection(taskId);

      return;
    }

    toggleTaskCompletion(taskId);
  }, [selectionMode, taskId, toggleTaskCompletion, toggleTaskSelection]);

  return {
    task,
    titleSegments,
    selectionMode,
    isSelected,
    isComplete: task?.isComplete ?? false,
    handleToggle,
  };
}
