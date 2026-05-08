import { Button } from "@/components/atoms/Button";
import styles from "./CreateColumnButton.module.css";

type CreateColumnButtonProps = {
  onClick: () => void;
};

export function CreateColumnButton({ onClick }: CreateColumnButtonProps) {
  return (
    <Button
      className={styles.createColumnButton}
      data-testid="topbar-create-column-button"
      onClick={onClick}
    >
      New column
    </Button>
  );
}
