import type { TaskFilter } from "@/features/TopBar/types";
import type { StoreState } from "@/store/types";
import { matchesSmartSearch } from "@/utils/taskSearch";

type Task = StoreState["tasks"][number];

type VisibleTaskQuery = {
  activeFilter: TaskFilter;
  searchTerm: string;
  columnId?: string;
};

function matchesTaskFilter(task: Task, activeFilter: TaskFilter) {
  if (activeFilter === "complete") {
    return task.isComplete;
  }

  if (activeFilter === "incomplete") {
    return !task.isComplete;
  }

  return true;
}

function matchesVisibleTaskQuery(task: Task, query: VisibleTaskQuery) {
  if (query.columnId && task.columnId !== query.columnId) {
    return false;
  }

  return (
    matchesTaskFilter(task, query.activeFilter) &&
    matchesSmartSearch(task.title, query.searchTerm)
  );
}

function getVisibleTasks(tasks: StoreState["tasks"], query: VisibleTaskQuery) {
  return tasks.filter((task) => matchesVisibleTaskQuery(task, query));
}

export function getVisibleTaskIds(
  tasks: StoreState["tasks"],
  query: VisibleTaskQuery,
) {
  return getVisibleTasks(tasks, query).map((task) => task.id);
}
