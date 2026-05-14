import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/Button/Button";
import { clsx } from "@/utils/clsx";
import styles from "./ConfirmationModal.module.css";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm(): void;
  onCancel(): void;
};

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const modalRoot = document.getElementById("modal-root");

  if (!isOpen || !modalRoot) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        aria-describedby="confirmation-modal-description"
        aria-labelledby="confirmation-modal-title"
        aria-modal="true"
        className={styles.modal}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onCancel();
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
        role="alertdialog"
      >
        <div className={styles.content}>
          <h2 className={styles.title} id="confirmation-modal-title">
            {title}
          </h2>
          <p className={styles.description} id="confirmation-modal-description">
            {description}
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            autoFocus
            className={styles.secondaryButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            className={clsx(styles.confirmButton, styles.dangerButton)}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}
