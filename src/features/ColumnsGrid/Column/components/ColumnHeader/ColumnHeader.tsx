import type { Ref } from "react";
import { memo } from "react";
import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton/ActionIconButton";
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
        <div className={styles.actions}>
          <EditIconButton
            aria-label="Edit column"
            onClick={onEdit}
          />

          <DeleteIconButton
            aria-label="Delete column"
            onClick={onDelete}
          />
        </div>
      </div>
    </header>
  );
}

export const ColumnHeader = memo(ColumnHeaderComponent);
