import { useCallback, useState } from "react";
import { useStore } from "@/store/store";
import { selectCreateColumn } from "@/store/selectors";

const DEFAULT_COLUMN_TITLE = "New Column";

type ColumnCreationState = {
  draftTitle: string;
  isCreatingColumn: boolean;
};

const DEFAULT_CREATION_STATE: ColumnCreationState = {
  draftTitle: DEFAULT_COLUMN_TITLE,
  isCreatingColumn: false,
};

function normalizeColumnTitle(title: string) {
  const normalizedTitle = title.trim();

  return normalizedTitle || DEFAULT_COLUMN_TITLE;
}

export function useColumnCreation() {
  const createColumn = useStore(selectCreateColumn);

  const [creationState, setCreationState] = useState<ColumnCreationState>(
    DEFAULT_CREATION_STATE,
  );

  const resetCreationState = useCallback(() => {
    setCreationState((currentState) => {
      if (
        currentState.draftTitle === DEFAULT_CREATION_STATE.draftTitle &&
        currentState.isCreatingColumn ===
          DEFAULT_CREATION_STATE.isCreatingColumn
      ) {
        return currentState;
      }

      return DEFAULT_CREATION_STATE;
    });
  }, []);

  const handleStartColumnCreation = useCallback(() => {
    setCreationState((currentState) => {
      if (
        currentState.draftTitle === DEFAULT_COLUMN_TITLE &&
        currentState.isCreatingColumn
      ) {
        return currentState;
      }

      return {
        draftTitle: DEFAULT_COLUMN_TITLE,
        isCreatingColumn: true,
      };
    });
  }, []);

  const handleDraftTitleChange = useCallback((title: string) => {
    setCreationState((currentState) => {
      if (currentState.draftTitle === title) {
        return currentState;
      }

      return {
        ...currentState,
        draftTitle: title,
      };
    });
  }, []);

  const handleCancelColumnCreation = useCallback(() => {
    resetCreationState();
  }, [resetCreationState]);

  const handleSaveColumnCreation = useCallback(() => {
    createColumn(normalizeColumnTitle(creationState.draftTitle));
    resetCreationState();
  }, [createColumn, creationState.draftTitle, resetCreationState]);

  return {
    draftTitle: creationState.draftTitle,
    isCreatingColumn: creationState.isCreatingColumn,
    handleDraftTitleChange,
    handleCancelColumnCreation,
    handleSaveColumnCreation,
    handleStartColumnCreation,
  };
}
