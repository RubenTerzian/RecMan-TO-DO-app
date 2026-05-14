import type { Ref } from "react";
import { memo } from "react";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import { ActionMenu } from "@/components/shared/ActionMenu/ActionMenu";
import { AddTaskButton } from "@/features/ColumnsGrid/Column/components/AddTaskButton/AddTaskButton";
import styles from "./ColumnHeader.module.css";

type ColumnHeaderProps = {
  title: string;
  onDelete(): void;
  onEdit(): void;
  dragHandleRef?: Ref<HTMLElement>;
};

function ColumnHeaderComponent({
  title,
  onDelete,
  onEdit,
  dragHandleRef,
}: ColumnHeaderProps) {
  return (
    <header
      ref={dragHandleRef}
      className={`${styles.columnHeader} ${styles.draggableHeader}`}
    >
      <div className={styles.titleGroup}>
        <button
          className={styles.dragCue}
          data-drag-handle="true"
          type="button"
          aria-label="Drag column"
        >
          <img src={dragHandleIcon} alt="" className={styles.dragIcon} />
        </button>

        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={styles.controls}>
        <AddTaskButton columnTitle={title} />
        <ActionMenu
          triggerAriaLabel={`Column actions for ${title}`}
          items={[
            { key: "edit", label: "Edit", onSelect: onEdit },
            {
              key: "delete",
              label: "Delete",
              variant: "danger",
              onSelect: onDelete,
            },
          ]}
        />
      </div>
    </header>
  );
}

export const ColumnHeader = memo(ColumnHeaderComponent);
