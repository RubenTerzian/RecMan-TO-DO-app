import { useCallback, useState } from "react";
import { useStore } from "@/store/store";
import { selectDeleteColumn, selectUpdateColumnTitle } from "@/store/selectors";

type ColumnEditingState = {
  draftTitle: string;
  isEditing: boolean;
};

type UseColumnEditingOptions = {
  columnId: string;
  title: string;
};

const DEFAULT_COLUMN_EDITING_STATE: ColumnEditingState = {
  draftTitle: "",
  isEditing: false,
};

function normalizeColumnTitle(title: string, fallbackTitle: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || fallbackTitle;
}

export function useColumnEditing({ columnId, title }: UseColumnEditingOptions) {
  const updateColumnTitle = useStore(selectUpdateColumnTitle);
  const deleteColumn = useStore(selectDeleteColumn);

  const [editingState, setEditingState] = useState<ColumnEditingState>(
    DEFAULT_COLUMN_EDITING_STATE,
  );

  const resetEditingState = useCallback(() => {
    setEditingState((currentState) => {
      if (
        currentState.draftTitle === DEFAULT_COLUMN_EDITING_STATE.draftTitle &&
        currentState.isEditing === DEFAULT_COLUMN_EDITING_STATE.isEditing
      ) {
        return currentState;
      }

      return DEFAULT_COLUMN_EDITING_STATE;
    });
  }, []);

  const handleStartEditing = useCallback(() => {
    setEditingState((currentState) => {
      if (currentState.isEditing && currentState.draftTitle === title) {
        return currentState;
      }

      return {
        draftTitle: title,
        isEditing: true,
      };
    });
  }, [title]);

  const handleDraftTitleChange = useCallback((nextTitle: string) => {
    setEditingState((currentState) => {
      if (currentState.draftTitle === nextTitle) {
        return currentState;
      }

      return {
        ...currentState,
        draftTitle: nextTitle,
      };
    });
  }, []);

  const handleCancelEditing = useCallback(() => {
    resetEditingState();
  }, [resetEditingState]);

  const handleSaveEditing = useCallback(() => {
    updateColumnTitle(
      columnId,
      normalizeColumnTitle(editingState.draftTitle, title),
    );
    resetEditingState();
  }, [
    columnId,
    editingState.draftTitle,
    resetEditingState,
    title,
    updateColumnTitle,
  ]);

  const handleDeleteColumn = useCallback(() => {
    deleteColumn(columnId);
  }, [columnId, deleteColumn]);

  return {
    draftTitle: editingState.draftTitle,
    isEditing: editingState.isEditing,
    handleCancelEditing,
    handleDeleteColumn,
    handleDraftTitleChange,
    handleSaveEditing,
    handleStartEditing,
  };
}
