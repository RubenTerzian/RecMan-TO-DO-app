import type {
  ColumnData,
  ColumnEmptyState,
} from "@/features/ColumnsGrid/Column/types";
import type { TaskCardData } from "@/features/ColumnsGrid/Task/types";
import type { StoreState } from "./types";

const DEFAULT_EMPTY_STATE: ColumnEmptyState = {
  variant: "empty",
  title: "No tasks yet",
  message: "Add your first task to start filling this column.",
};

const NO_RESULTS_EMPTY_STATE: ColumnEmptyState = {
  variant: "no-results",
  title: "No matching tasks",
  message: "Try a different search or filter to see tasks here.",
};

function matchesSearchTerm(title: string, searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return title.toLowerCase().includes(normalizedSearchTerm);
}

function matchesActiveFilter(
  isComplete: boolean,
  activeFilter: StoreState["activeFilter"],
) {
  if (activeFilter === "complete") {
    return isComplete;
  }

  if (activeFilter === "incomplete") {
    return !isComplete;
  }

  return true;
}

function mapTaskToCardData(task: StoreState["tasks"][number]): TaskCardData {
  return {
    id: task.id,
    title: task.title,
    isComplete: task.isComplete,
  };
}

function groupTasksByColumnId(tasks: StoreState["tasks"]) {
  return tasks.reduce<Record<string, StoreState["tasks"]>>((groups, task) => {
    const tasksForColumn = groups[task.columnId] ?? [];

    return {
      ...groups,
      [task.columnId]: [...tasksForColumn, task],
    };
  }, {});
}

function getEmptyState(
  totalTaskCount: number,
  visibleTaskCount: number,
  hasActiveTaskFilters: boolean,
): ColumnEmptyState {
  if (totalTaskCount > 0 && visibleTaskCount === 0 && hasActiveTaskFilters) {
    return NO_RESULTS_EMPTY_STATE;
  }

  return DEFAULT_EMPTY_STATE;
}

export function selectColumnCount(state: StoreState) {
  return state.columns.length;
}

export function selectSelectionMode(state: StoreState) {
  return state.selectionMode;
}

export function selectColumnsForDisplay(
  columns: StoreState["columns"],
  tasks: StoreState["tasks"],
  activeFilter: StoreState["activeFilter"],
  searchTerm: StoreState["searchTerm"],
  selectedTaskIds: StoreState["selectedTaskIds"],
): ColumnData[] {
  const hasActiveTaskFilters =
    activeFilter !== "all" || searchTerm.trim().length > 0;
  const selectedTaskIdSet = new Set(selectedTaskIds);
  const tasksByColumnId = groupTasksByColumnId(tasks);

  return columns.map((column) => {
    const columnTasks = tasksByColumnId[column.id] ?? [];
    const visibleTasks = columnTasks
      .filter(
        (task) =>
          matchesActiveFilter(task.isComplete, activeFilter) &&
          matchesSearchTerm(task.title, searchTerm),
      )
      .map((task) => ({
        ...mapTaskToCardData(task),
        isSelected: selectedTaskIdSet.has(task.id),
      }));

    return {
      kind: "display",
      id: column.id,
      title: column.title,
      tasks: visibleTasks,
      emptyState: getEmptyState(
        columnTasks.length,
        visibleTasks.length,
        hasActiveTaskFilters,
      ),
    };
  });
}
