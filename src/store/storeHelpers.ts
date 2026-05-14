import type { StoreState } from "./types";

export type AppSelectionState = Pick<
  StoreState,
  "tasks" | "selectedTaskIds"
>;

export function moveItem<TItem>(
  items: TItem[],
  startIndex: number,
  finishIndex: number,
) {
  if (
    startIndex < 0 ||
    finishIndex < 0 ||
    startIndex >= items.length ||
    finishIndex >= items.length ||
    startIndex === finishIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(startIndex, 1);

  nextItems.splice(finishIndex, 0, movedItem);

  return nextItems;
}

export function toggleIdInList(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function clearSelectionAfterTaskMutation<
  TState extends AppSelectionState,
>(state: TState, tasks: StoreState["tasks"]) {
  return {
    ...state,
    tasks,
    selectedTaskIds: [],
  };
}

export function getColumnTasks(
  tasks: StoreState["tasks"],
  columnId: string,
) {
  return tasks.filter((task) => task.columnId === columnId);
}

export function replaceTasksInColumn(
  tasks: StoreState["tasks"],
  columnId: string,
  nextColumnTasks: StoreState["tasks"],
) {
  let nextColumnTaskIndex = 0;

  const nextTasks = tasks.flatMap((task) => {
    if (task.columnId !== columnId) {
      return [task];
    }

    if (nextColumnTaskIndex >= nextColumnTasks.length) {
      return [];
    }

    const nextTask = nextColumnTasks[nextColumnTaskIndex];
    nextColumnTaskIndex += 1;

    return [nextTask];
  });

  if (nextColumnTaskIndex >= nextColumnTasks.length) {
    return nextTasks;
  }

  return [...nextTasks, ...nextColumnTasks.slice(nextColumnTaskIndex)];
}

export function mergeTasksAtCompletionBoundary(
  existingColumnTasks: StoreState["tasks"],
  incomingTasks: StoreState["tasks"],
) {
  const remainingIncompleteTasks = existingColumnTasks.filter(
    (task) => !task.isComplete,
  );
  const remainingCompleteTasks = existingColumnTasks.filter(
    (task) => task.isComplete,
  );
  const incomingIncompleteTasks = incomingTasks.filter(
    (task) => !task.isComplete,
  );
  const incomingCompleteTasks = incomingTasks.filter((task) => task.isComplete);

  return [
    ...remainingIncompleteTasks,
    ...incomingIncompleteTasks,
    ...incomingCompleteTasks,
    ...remainingCompleteTasks,
  ];
}

export function prependTasksInColumn(
  existingColumnTasks: StoreState["tasks"],
  incomingTasks: StoreState["tasks"],
) {
  return [...incomingTasks, ...existingColumnTasks];
}

export function reorderTasksForCompletionChange(
  columnTasks: StoreState["tasks"],
  taskIds: string[],
  isComplete: boolean,
) {
  const taskIdSet = new Set(taskIds);
  const movingTasks = columnTasks
    .filter((task) => taskIdSet.has(task.id))
    .map((task) => ({ ...task, isComplete }));
  const remainingTasks = columnTasks.filter((task) => !taskIdSet.has(task.id));

  return mergeTasksAtCompletionBoundary(remainingTasks, movingTasks);
}

export function removeTaskAndSelection<TState extends AppSelectionState>(
  state: TState,
  taskId: string,
) {
  return {
    tasks: state.tasks.filter((task) => task.id !== taskId),
    selectedTaskIds: state.selectedTaskIds.filter(
      (selectedTaskId) => selectedTaskId !== taskId,
    ),
  };
}

function getColumnBoundaryInsertionIndex(
  tasks: StoreState["tasks"],
  columns: StoreState["columns"],
  columnId: string,
) {
  const lastTaskIndex = tasks.reduce((result, task, index) => {
    if (task.columnId !== columnId) {
      return result;
    }

    return index;
  }, -1);

  if (lastTaskIndex >= 0) {
    return lastTaskIndex + 1;
  }

  const columnIndex = columns.findIndex((column) => column.id === columnId);

  if (columnIndex < 0) {
    return tasks.length;
  }

  for (
    let nextColumnIndex = columnIndex + 1;
    nextColumnIndex < columns.length;
    nextColumnIndex += 1
  ) {
    const nextColumnId = columns[nextColumnIndex]?.id;

    if (!nextColumnId) {
      continue;
    }

    const nextTaskIndex = tasks.findIndex(
      (task) => task.columnId === nextColumnId,
    );

    if (nextTaskIndex >= 0) {
      return nextTaskIndex;
    }
  }

  return tasks.length;
}

export function moveTaskToDestination(
  tasks: StoreState["tasks"],
  columns: StoreState["columns"],
  taskId: string,
  destination: {
    columnId: string;
    targetTaskId?: string;
    position?: "before" | "after";
  },
) {
  const movingTask = tasks.find((task) => task.id === taskId);

  if (!movingTask) {
    return tasks;
  }

  const remainingTasks = tasks.filter((task) => task.id !== taskId);
  const movedTask = {
    ...movingTask,
    columnId: destination.columnId,
  };

  if (destination.targetTaskId) {
    const targetIndex = remainingTasks.findIndex(
      (task) => task.id === destination.targetTaskId,
    );

    if (targetIndex >= 0) {
      const insertionIndex =
        destination.position === "after" ? targetIndex + 1 : targetIndex;

      return [
        ...remainingTasks.slice(0, insertionIndex),
        movedTask,
        ...remainingTasks.slice(insertionIndex),
      ];
    }
  }

  const insertionIndex = getColumnBoundaryInsertionIndex(
    remainingTasks,
    columns,
    destination.columnId,
  );

  return [
    ...remainingTasks.slice(0, insertionIndex),
    movedTask,
    ...remainingTasks.slice(insertionIndex),
  ];
}
