import type { ButtonHTMLAttributes } from "react";
import { memo } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./CircleAddButton.module.css";

type CircleAddButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  "aria-label": string;
};

function CircleAddButtonComponent({
  className,
  type = "button",
  ...props
}: CircleAddButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.circleAddButton, className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export const CircleAddButton = memo(CircleAddButtonComponent);
