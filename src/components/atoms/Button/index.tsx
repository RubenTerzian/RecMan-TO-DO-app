import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={clsx(styles.button, className)} type={type} {...props}>
      {children}
    </button>
  );
}
