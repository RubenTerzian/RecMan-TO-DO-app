import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useStore } from "@/store/store";
import { selectCreateTask } from "@/store/selectors";

const DEFAULT_TASK_TITLE = "New Task";

type UseColumnTaskCreationOptions = {
  columnId: string;
};

export function useColumnTaskCreation({
  columnId,
}: UseColumnTaskCreationOptions) {
  const createTask = useStore(selectCreateTask);

  const editor = useInlineEditor<string>({
    initialDraft: DEFAULT_TASK_TITLE,
    normalize: (draft) => draft.trim() || DEFAULT_TASK_TITLE,
    onCommit: (nextTitle) => createTask(columnId, nextTitle),
  });

  return {
    draftTaskTitle: editor.draft,
    isCreatingTask: editor.isActive,
    handleCancelTaskCreation: editor.cancel,
    handleSaveTaskCreation: editor.save,
    handleStartTaskCreation: editor.start,
    handleTaskEditorBlur: editor.handleBlur,
    handleTaskTitleChange: editor.update,
  };
}
