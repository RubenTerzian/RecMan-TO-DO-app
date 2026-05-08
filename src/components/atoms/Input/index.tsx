import type { InputHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return <input className={clsx(styles.input, className)} {...props} />;
}
