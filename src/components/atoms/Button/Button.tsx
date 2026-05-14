import type { ButtonHTMLAttributes, ReactNode } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

function ButtonComponent({
  className = "",
  children,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export const Button = memo(ButtonComponent);
