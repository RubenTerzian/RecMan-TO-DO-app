import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/atoms/Button";
import { clsx } from "@/utils/clsx";
import styles from "./CreateColumnButton.module.css";

type CreateColumnButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  label?: string;
};

export function CreateColumnButton({
  className,
  label = "Add a New Column",
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
