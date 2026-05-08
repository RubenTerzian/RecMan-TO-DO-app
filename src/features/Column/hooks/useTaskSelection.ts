export function useTaskSelection() {
  return {
    selectedTaskIds: [] as string[],
    toggleTaskSelection() {},
    clearTaskSelection() {},
  };
}
