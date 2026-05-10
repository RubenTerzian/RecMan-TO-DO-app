import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRafThrottle } from "../../../hooks/useRafThrottle";
import { clsx } from "@/utils/clsx";
import styles from "./Select.module.css";

type SelectChangeEvent = {
  target: {
    value: string;
  };
};

type SelectProps = {
  children: ReactNode;
  className?: string;
  value?: string;
  disabled?: boolean;
  onChange?(event: SelectChangeEvent): void;
  "aria-label"?: string;
  "data-testid"?: string;
  name?: string;
};

type SelectOption = {
  value: string;
  label: ReactNode;
  disabled: boolean;
};

type OptionElementProps = {
  value?: string;
  children?: ReactNode;
  disabled?: boolean;
};

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

function toOptions(children: ReactNode) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionElementProps>(child) || child.type !== "option") {
      return [];
    }

    return [
      {
        value: String(child.props.value ?? ""),
        label: child.props.children,
        disabled: Boolean(child.props.disabled),
      } satisfies SelectOption,
    ];
  });
}

export function Select({
  children,
  className = "",
  value = "",
  disabled = false,
  onChange,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const options = useMemo(() => toOptions(children), [children]);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0] ?? null;
  const isPopoverOpen = isOpen && !disabled;

  const updatePopoverPosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPopoverPosition((currentValue) => {
      const nextValue = {
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      };

      if (
        currentValue?.top === nextValue.top &&
        currentValue.left === nextValue.left &&
        currentValue.width === nextValue.width
      ) {
        return currentValue;
      }

      return nextValue;
    });
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        updatePopoverPosition();
      }

      return nextValue;
    });
  }, [disabled, updatePopoverPosition]);
  const {
    schedule: schedulePopoverPositionUpdate,
    cancel: cancelPopoverPositionUpdate,
  } = useRafThrottle(updatePopoverPosition);

  const handleSelect = useCallback(
    (nextValue: string, isOptionDisabled: boolean) => {
      if (disabled || isOptionDisabled) {
        return;
      }

      onChange?.({
        target: {
          value: nextValue,
        },
      });
      setIsOpen(false);
    },
    [disabled, onChange],
  );

  useLayoutEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    updatePopoverPosition();

    const handleViewportChange = () => {
      schedulePopoverPositionUpdate();
    };

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (
        containerRef.current?.contains(targetNode) ||
        popoverRef.current?.contains(targetNode)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelPopoverPositionUpdate();
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    cancelPopoverPositionUpdate,
    isPopoverOpen,
    schedulePopoverPositionUpdate,
    updatePopoverPosition,
  ]);

  const popover =
    isPopoverOpen && popoverPosition
      ? createPortal(
          <div
            className={styles.popover}
            ref={popoverRef}
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: `${popoverPosition.width}px`,
            }}
          >
            <ul className={styles.listbox} id={listboxId} role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value}>
                    <button
                      aria-selected={isSelected}
                      className={clsx(styles.option, {
                        [styles.optionSelected]: isSelected,
                        [styles.optionDisabled]: option.disabled,
                      })}
                      disabled={option.disabled}
                      onClick={() =>
                        handleSelect(option.value, option.disabled)
                      }
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={clsx(styles.select, className)} ref={containerRef}>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={styles.trigger}
        data-testid={dataTestId}
        disabled={disabled}
        onClick={handleToggle}
        type="button"
      >
        <span className={styles.triggerLabel}>{selectedOption?.label}</span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>
      {popover}
    </div>
  );
}
