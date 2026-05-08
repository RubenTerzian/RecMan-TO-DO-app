import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./IconButton.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({
  className = "",
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={clsx(styles.iconButton, className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
