import type { TopBarState } from "@/features/TopBar/types";
import type { ColumnEmptyState } from "@/features/Column/types";

export type MockScreenId =
  | "empty"
  | "populated"
  | "editing"
  | "selection"
  | "no-results"
  | "mobile-reorder";

export type MockTask = {
  id: string;
  title: string;
  tag?: string;
  isComplete?: boolean;
  isSelected?: boolean;
  editorMode?: "create" | "edit";
};

export type MockColumn = {
  id: string;
  title: string;
  subtitle: string;
  tasks: MockTask[];
  emptyState?: ColumnEmptyState;
  showMobileReorderMenu?: boolean;
  editorMode?: "create" | "edit";
  draftTitle?: string;
};

export type MockBoardState = {
  variant: "empty" | "board" | "no-results";
  selectionMode?: boolean;
  columns?: MockColumn[];
  showCreateColumnCard?: boolean;
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
  { id: "editing", label: "Editing" },
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
    tasks: [
      {
        id: "task-follow-up",
        title: "Follow up with shortlisted candidates",
        tag: "Follow-up",
      },
      {
        id: "task-long-backlog-1",
        title:
          "Draft a detailed follow-up summary for every shortlisted candidate before tomorrow morning standup",
        tag: "Long",
      },
      {
        id: "task-brief",
        title: "Prepare intake brief",
        tag: "Draft",
      },
      {
        id: "task-long-backlog-2",
        title:
          "Coordinate final interview availability across hiring managers, recruiter notes, and candidate calendar windows",
        tag: "Long",
      },
      {
        id: "task-copy",
        title: "Refresh job ad copy",
        tag: "Review",
      },
    ],
  },
  {
    id: "column-in-progress",
    title: "In progress",
    subtitle: "Active work",
    tasks: [
      {
        id: "task-screening",
        title: "Screen inbound applicants",
        tag: "Priority",
      },
      {
        id: "task-long-progress-1",
        title:
          "Prepare a structured interview feedback packet for the shortlisted platform engineering candidates",
        tag: "Long",
      },
      {
        id: "task-complete",
        title: "Confirm interview agenda",
        tag: "Done",
        isComplete: true,
      },
    ],
  },
  {
    id: "column-done",
    title: "Done",
    subtitle: "Completed work",
    tasks: [],
    emptyState: {
      variant: "empty",
      title: "Nothing here yet",
      message: "Drop tasks here or add a new one.",
    },
  },
  {
    id: "column-screening",
    title: "Screening",
    subtitle: "Initial review",
    tasks: [
      {
        id: "task-screening-1",
        title: "Review inbound product designer applications",
        tag: "Review",
      },
      {
        id: "task-screening-2",
        title: "Shortlist recruiter call candidates",
        tag: "Shortlist",
      },
    ],
  },
  {
    id: "column-interviews",
    title: "Interviews",
    subtitle: "Panel stage",
    tasks: [
      {
        id: "task-interview-1",
        title: "Confirm panel schedule for backend role",
        tag: "Schedule",
      },
      {
        id: "task-interview-2",
        title: "Send interview prep note to shortlisted candidate",
        tag: "Share",
      },
    ],
  },
  {
    id: "column-offers",
    title: "Offers",
    subtitle: "Final handoff",
    tasks: [
      {
        id: "task-offer-1",
        title: "Prepare final compensation summary",
        tag: "Offer",
      },
    ],
  },
];

const selectionColumns: MockColumn[] = [
  {
    id: "column-review",
    title: "Review",
    subtitle: "Visible tasks",
    tasks: [
      {
        id: "task-selected-1",
        title: "Send shortlist summary",
        tag: "Selected",
        isSelected: true,
      },
      {
        id: "task-selected-2",
        title: "Collect interview feedback",
        tag: "Selected",
        isSelected: true,
      },
    ],
  },
  {
    id: "column-next",
    title: "Next steps",
    subtitle: "Visible tasks",
    tasks: [
      {
        id: "task-selected-3",
        title: "Book final interview",
        tag: "Selected",
        isSelected: true,
      },
      {
        id: "task-selected-4",
        title: "Update candidate notes",
        tag: "Open",
      },
    ],
  },
];

const editingColumns: MockColumn[] = [
  {
    id: "column-planning",
    title: "Planning",
    subtitle: "Draft states",
    tasks: [
      {
        id: "task-planning-1",
        title: "Review hiring manager notes",
        tag: "Review",
      },
      {
        id: "task-planning-edit",
        title: "Prepare onboarding checklist",
        editorMode: "edit",
      },
      {
        id: "task-planning-create",
        title: "",
        editorMode: "create",
      },
    ],
  },
  {
    id: "column-feedback",
    title: "Candidate feedback",
    subtitle: "Renaming lane",
    draftTitle: "Feedback & next steps",
    editorMode: "edit",
    tasks: [],
    emptyState: {
      variant: "empty",
      title: "Column is empty",
      message: "Drop tasks here after you save the renamed column.",
    },
  },
  {
    id: "column-new",
    title: "",
    subtitle: "New lane",
    draftTitle: "Offer approvals",
    editorMode: "create",
    tasks: [],
  },
];

const mobileColumns: MockColumn[] = [
  {
    id: "column-mobile-today",
    title: "Today",
    subtitle: "Mobile reorder",
    showMobileReorderMenu: true,
    tasks: [
      {
        id: "task-mobile-1",
        title:
          "Move the shortlisted customer success onboarding task to screening",
        tag: "Move",
      },
      {
        id: "task-mobile-2",
        title:
          "Reorder the follow-up list for candidates waiting on hiring manager feedback",
        tag: "Mobile",
      },
      {
        id: "task-mobile-4",
        title:
          "Share a long mobile-friendly handoff note with the recruiter before end of day",
        tag: "Long",
      },
    ],
  },
  {
    id: "column-mobile-up-next",
    title: "Up next",
    subtitle: "Compact lane",
    tasks: [
      {
        id: "task-mobile-3",
        title: "Share interview recap",
        tag: "Share",
      },
    ],
  },
];

function createNoResultsColumns(columns: MockColumn[]): MockColumn[] {
  return columns.map((column) => {
    if (column.tasks.length === 0) {
      return column;
    }

    return {
      ...column,
      tasks: [],
      emptyState: {
        variant: "no-results",
        title: "No matching tasks",
        message: "Try another search term or clear the filter to show matching tasks in this column.",
      },
    };
  });
}

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
  editing: {
    id: "editing",
    label: "Create and edit",
    topBar: {
      searchTerm: "",
      activeFilter: "all",
      isSelectionMode: false,
      selectionCount: 0,
    },
    board: {
      variant: "board",
      columns: editingColumns,
      showCreateColumnCard: false,
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
      bulkActions: {
        moveTargetId: "column-next",
        availableColumns: [
          { id: "column-review", label: "Review" },
          { id: "column-next", label: "Next steps" },
          { id: "column-backlog", label: "Backlog" },
          { id: "column-done", label: "Done" },
        ],
      },
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
      variant: "board",
      columns: createNoResultsColumns(populatedColumns),
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
