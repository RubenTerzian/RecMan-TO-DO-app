export type TaskCardData = {
  id: string;
  title: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

export type TaskEditorData = {
  id: string;
  title: string;
  mode: "create" | "edit";
};
