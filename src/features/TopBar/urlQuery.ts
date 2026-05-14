import type { TaskFilter } from "@/features/TopBar/types";

const SEARCH_QUERY_PARAM = "search";
const FILTER_QUERY_PARAM = "filter";

export type TaskQueryState = {
  searchTerm: string;
  activeFilter: TaskFilter;
};

const DEFAULT_TASK_QUERY_STATE: TaskQueryState = {
  searchTerm: "",
  activeFilter: "all",
};

function isTaskFilter(value: string | null): value is TaskFilter {
  return value === "all" || value === "complete" || value === "incomplete";
}

export function readTaskQueryState(search = window.location.search) {
  const searchParams = new URLSearchParams(search);
  const requestedFilter = searchParams.get(FILTER_QUERY_PARAM);

  return {
    searchTerm:
      searchParams.get(SEARCH_QUERY_PARAM) ??
      DEFAULT_TASK_QUERY_STATE.searchTerm,
    activeFilter: isTaskFilter(requestedFilter)
      ? requestedFilter
      : DEFAULT_TASK_QUERY_STATE.activeFilter,
  } satisfies TaskQueryState;
}

export function writeTaskQueryState(state: TaskQueryState) {
  const url = new URL(window.location.href);

  if (state.searchTerm.trim()) {
    url.searchParams.set(SEARCH_QUERY_PARAM, state.searchTerm);
  } else {
    url.searchParams.delete(SEARCH_QUERY_PARAM);
  }

  if (state.activeFilter !== DEFAULT_TASK_QUERY_STATE.activeFilter) {
    url.searchParams.set(FILTER_QUERY_PARAM, state.activeFilter);
  } else {
    url.searchParams.delete(FILTER_QUERY_PARAM);
  }

  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath === currentPath) {
    return;
  }

  window.history.replaceState(null, "", nextPath);
}
