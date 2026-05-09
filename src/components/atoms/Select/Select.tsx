import type { SelectHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Select.module.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", ...props }: SelectProps) {
  return <select className={clsx(styles.select, className)} {...props} />;
}
