export type TaskCardData = {
  kind: "task";
  id: string;
  title: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

export type TaskEditorData = {
  kind: "task-editor";
  id: string;
  title: string;
  mode: "create" | "edit";
};

export type TaskData = TaskCardData | TaskEditorData;
