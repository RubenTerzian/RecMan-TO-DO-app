import dragHandleIcon from "@/assets/icons/drag-handle.svg";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/shared/ActionIconButton";
import styles from "./ColumnHeader.module.css";

type BaseColumnHeaderProps = {
  title: string;
};

type DefaultColumnHeaderProps = BaseColumnHeaderProps & {
  mode: "default";
};

type SelectionColumnHeaderProps = BaseColumnHeaderProps & {
  mode: "selection";
  allSelected?: boolean;
  showSelectionToggle?: boolean;
};

type ColumnHeaderProps = DefaultColumnHeaderProps | SelectionColumnHeaderProps;

export function ColumnHeader({ title, ...props }: ColumnHeaderProps) {
  const selectionMode = props.mode === "selection";
  const allSelected =
    props.mode === "selection" ? (props.allSelected ?? false) : false;
  const showSelectionToggle =
    props.mode === "selection" ? (props.showSelectionToggle ?? false) : false;

  return (
    <header
      className={
        selectionMode
          ? styles.columnHeader
          : `${styles.columnHeader} ${styles.draggableHeader}`
      }
    >
      <div className={styles.titleGroup}>
        {!selectionMode ? (
          <div className={styles.dragCue} aria-hidden="true">
            <img src={dragHandleIcon} alt="" className={styles.dragIcon} />
          </div>
        ) : null}

        <h3 className={styles.title}>{title}</h3>
      </div>

      {!selectionMode ? (
        <div className={styles.actions}>
          <EditIconButton
            data-testid="edit-column-button"
            aria-label="Edit column"
          />

          <DeleteIconButton
            data-testid="delete-column-button"
            aria-label="Delete column"
          />
        </div>
      ) : showSelectionToggle ? (
        <button className={styles.selectionToggle} type="button">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      ) : null}
    </header>
  );
}
