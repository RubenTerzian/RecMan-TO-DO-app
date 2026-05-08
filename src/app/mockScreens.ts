import type { TaskFilter, TopBarState } from "@/features/TopBar/types";

export type MockScreenId =
  | "empty"
  | "populated"
  | "selection"
  | "no-results"
  | "mobile-reorder";

export type MockTask = {
  id: string;
  title: string;
  meta: string;
  tag: string;
  isComplete?: boolean;
  isSelected?: boolean;
};

export type MockColumn = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta: string;
  tasks: MockTask[];
  emptyMessage?: string;
  showMobileReorderMenu?: boolean;
};

export type MockBoardState = {
  variant: "empty" | "board" | "no-results";
  selectionMode?: boolean;
  columns?: MockColumn[];
  noResults?: {
    title: string;
    description: string;
    searchTerm: string;
    filter: TaskFilter;
  };
};

export type MockScreen = {
  id: MockScreenId;
  label: string;
  topBar: TopBarState;
  board: MockBoardState;
};

export const MOCK_SCREEN_OPTIONS: Array<Pick<MockScreen, "id" | "label">> = [
  { id: "empty", label: "Empty" },
  { id: "populated", label: "Board" },
  { id: "selection", label: "Selection" },
  { id: "no-results", label: "No results" },
  { id: "mobile-reorder", label: "Mobile" },
];

export const DEFAULT_MOCK_SCREEN: MockScreenId = "empty";

const populatedColumns: MockColumn[] = [
  {
    id: "column-backlog",
    title: "Backlog",
    subtitle: "Ready to triage",
    status: "Regular mode",
    meta: "3 visible tasks",
    tasks: [
      {
        id: "task-follow-up",
        title: "Follow up with shortlisted candidates",
        meta: "2 unread notes · Today",
        tag: "Follow-up",
      },
      {
        id: "task-brief",
        title: "Prepare intake brief",
        meta: "Draft shared with team",
        tag: "Draft",
      },
      {
        id: "task-copy",
        title: "Refresh job ad copy",
        meta: "Waiting for review",
        tag: "Review",
      },
    ],
  },
  {
    id: "column-in-progress",
    title: "In progress",
    subtitle: "Active work",
    status: "Focused",
    meta: "2 visible tasks",
    tasks: [
      {
        id: "task-screening",
        title: "Screen inbound applicants",
        meta: "6 profiles ready",
        tag: "Priority",
      },
      {
        id: "task-complete",
        title: "Confirm interview agenda",
        meta: "Candidate notified",
        tag: "Done",
        isComplete: true,
      },
    ],
  },
  {
    id: "column-done",
    title: "Done",
    subtitle: "Completed work",
    status: "Stable",
    meta: "Empty drop target",
    tasks: [],
    emptyMessage: "Drop tasks here or add a new one.",
  },
];

const selectionColumns: MockColumn[] = [
  {
    id: "column-review",
    title: "Review",
    subtitle: "Visible tasks",
    status: "Selection mode",
    meta: "2 selected",
    tasks: [
      {
        id: "task-selected-1",
        title: "Send shortlist summary",
        meta: "Ready for bulk move",
        tag: "Selected",
        isSelected: true,
      },
      {
        id: "task-selected-2",
        title: "Collect interview feedback",
        meta: "Waiting for panel",
        tag: "Selected",
        isSelected: true,
      },
    ],
  },
  {
    id: "column-next",
    title: "Next steps",
    subtitle: "Visible tasks",
    status: "Selection mode",
    meta: "1 selected",
    tasks: [
      {
        id: "task-selected-3",
        title: "Book final interview",
        meta: "Move to client handoff",
        tag: "Selected",
        isSelected: true,
      },
      {
        id: "task-selected-4",
        title: "Update candidate notes",
        meta: "Not selected",
        tag: "Open",
      },
    ],
  },
];

const mobileColumns: MockColumn[] = [
  {
    id: "column-mobile-today",
    title: "Today",
    subtitle: "Mobile reorder",
    status: "Tap actions",
    meta: "Use buttons instead of drag",
    showMobileReorderMenu: true,
    tasks: [
      {
        id: "task-mobile-1",
        title: "Move task to screening",
        meta: "Mobile-safe control",
        tag: "Move",
      },
      {
        id: "task-mobile-2",
        title: "Reorder follow-up list",
        meta: "No direct drag needed",
        tag: "Mobile",
      },
    ],
  },
  {
    id: "column-mobile-up-next",
    title: "Up next",
    subtitle: "Compact lane",
    status: "Visible",
    meta: "1 task",
    tasks: [
      {
        id: "task-mobile-3",
        title: "Share interview recap",
        meta: "Ready to move",
        tag: "Share",
      },
    ],
  },
];

const mockScreens: Record<MockScreenId, MockScreen> = {
  empty: {
    id: "empty",
    label: "Empty onboarding",
    topBar: {
      searchTerm: "",
      activeFilter: "all",
      isSelectionMode: false,
      selectionCount: 0,
    },
    board: {
      variant: "empty",
    },
  },
  populated: {
    id: "populated",
    label: "Populated board",
    topBar: {
      searchTerm: "",
      activeFilter: "all",
      isSelectionMode: false,
      selectionCount: 0,
    },
    board: {
      variant: "board",
      columns: populatedColumns,
    },
  },
  selection: {
    id: "selection",
    label: "Selection mode",
    topBar: {
      searchTerm: "candidate",
      activeFilter: "incomplete",
      isSelectionMode: true,
      selectionCount: 3,
    },
    board: {
      variant: "board",
      selectionMode: true,
      columns: selectionColumns,
    },
  },
  "no-results": {
    id: "no-results",
    label: "No results",
    topBar: {
      searchTerm: "backend architect",
      activeFilter: "complete",
      isSelectionMode: false,
      selectionCount: 0,
    },
    board: {
      variant: "no-results",
      noResults: {
        title: "No visible tasks",
        description: "Try another search term or clear the filter to show tasks again.",
        searchTerm: "backend architect",
        filter: "complete",
      },
    },
  },
  "mobile-reorder": {
    id: "mobile-reorder",
    label: "Mobile reorder",
    topBar: {
      searchTerm: "",
      activeFilter: "all",
      isSelectionMode: false,
      selectionCount: 0,
    },
    board: {
      variant: "board",
      columns: mobileColumns,
    },
  },
};

export function getMockScreen(screenId: MockScreenId) {
  return mockScreens[screenId];
}