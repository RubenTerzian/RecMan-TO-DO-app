import type { InputHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Checkbox.module.css";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({
  className = "",
  type = "checkbox",
  ...props
}: CheckboxProps) {
  return (
    <input
      className={clsx(styles.checkbox, className)}
      type={type}
      {...props}
    />
  );
}
