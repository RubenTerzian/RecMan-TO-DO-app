import { memo } from "react";
import { EmptyColumnState } from "@/features/ColumnsGrid/Column/components/EmptyColumnState/EmptyColumnState";
import { useEmptyColumnPreview } from "@/features/ColumnsGrid/Task/hooks/useTaskDragAndDrop";
import type { ColumnEmptyState } from "@/features/ColumnsGrid/Column/types";

type EmptyColumnDropStateProps = {
  columnId: string;
  emptyState: ColumnEmptyState | undefined;
  registerEmptyColumnDropTarget(
    columnId: string,
    element: HTMLElement | null,
  ): void;
};

function EmptyColumnDropStateComponent({
  columnId,
  emptyState,
  registerEmptyColumnDropTarget,
}: EmptyColumnDropStateProps) {
  const previewTitle = useEmptyColumnPreview(columnId);

  return (
    <EmptyColumnState
      containerRef={(element) => {
        if (emptyState?.variant === "empty") {
          registerEmptyColumnDropTarget(columnId, element);

          return;
        }

        registerEmptyColumnDropTarget(columnId, null);
      }}
      isDropActive={previewTitle !== null}
      variant={emptyState?.variant}
      title={emptyState?.title}
      message={emptyState?.message}
      previewTitle={previewTitle ?? undefined}
      testId="empty-column-drop-target"
    />
  );
}

export const EmptyColumnDropState = memo(EmptyColumnDropStateComponent);
