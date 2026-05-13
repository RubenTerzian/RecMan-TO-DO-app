import type { InputHTMLAttributes } from "react";
import { forwardRef, memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  function InputComponent({ className = "", ...props }, ref) {
    return (
      <input ref={ref} className={clsx(styles.input, className)} {...props} />
    );
  },
);

export const Input = memo(InputComponent);
