import type { InputHTMLAttributes } from "react";
import { memo, useEffect, useRef } from "react";
import { clsx } from "@/utils/clsx";
import styles from "./Checkbox.module.css";

type CheckboxShape = "round" | "square";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /**
   * Visual shape of the checkbox.
   * - `round` (default) — used for "toggle completion" affordances.
   * - `square` — used for selection-mode multi-select.
   */
  shape?: CheckboxShape;
  /**
   * Tri-state visual: when true, renders a filled background with a
   * dash mark to communicate a partial selection. Only meaningful for
   * the `square` shape (column-header select-all checkbox).
   */
  indeterminate?: boolean;
};

function CheckboxComponent({
  className = "",
  shape = "round",
  indeterminate = false,
  checked,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // The DOM-only `indeterminate` flag must be synced via an effect.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      data-shape={shape}
      data-indeterminate={indeterminate ? "true" : undefined}
      className={clsx(
        styles.checkbox,
        shape === "square" ? styles.square : styles.round,
        indeterminate ? styles.indeterminate : null,
        className,
      )}
      {...props}
    />
  );
}

export const Checkbox = memo(CheckboxComponent);
