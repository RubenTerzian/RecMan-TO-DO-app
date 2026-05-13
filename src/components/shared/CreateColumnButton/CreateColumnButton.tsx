import type { ButtonHTMLAttributes } from "react";
import { memo } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { clsx } from "@/utils/clsx";
import styles from "./CreateColumnButton.module.css";

type CreateColumnButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  label?: string;
};

function CreateColumnButtonComponent({
  className,
  label = "Add New Column",
  type = "button",
  ...props
}: CreateColumnButtonProps) {
  return (
    <Button
      className={clsx(styles.createColumnButton, className)}
      type={type}
      {...props}
    >
      {label}
    </Button>
  );
}

export const CreateColumnButton = memo(CreateColumnButtonComponent);
