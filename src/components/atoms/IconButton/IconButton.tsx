import type { ButtonHTMLAttributes, ReactNode } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./IconButton.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function IconButtonComponent({
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

export const IconButton = memo(IconButtonComponent);
