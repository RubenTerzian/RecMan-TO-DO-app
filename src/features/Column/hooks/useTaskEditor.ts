export function useTaskEditor() {
  return {
    editingTaskId: null as string | null,
    startEditing() {},
    cancelEditing() {},
    saveEditing() {},
  };
}
