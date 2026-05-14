import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { clsx } from "@/utils/clsx";
import { useRafThrottle } from "@/hooks/useRafThrottle";
import styles from "./ActionMenu.module.css";

type ActionMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  onSelect(): void;
};

type ActionMenuProps = {
  items: readonly ActionMenuItem[];
  /** Accessible label for the trigger button (e.g. "Task actions"). */
  triggerAriaLabel: string;
  className?: string;
  /** Optional className applied to the trigger only. */
  triggerClassName?: string;
};

type PopoverPosition = {
  top: number;
  left: number;
  /** "right" anchored: distance from the right edge of the viewport. */
  right?: number;
};

const POPOVER_MIN_WIDTH = 168;
const POPOVER_OFFSET = 6;

function getPopoverPosition(trigger: HTMLButtonElement): PopoverPosition {
  const rect = trigger.getBoundingClientRect();
  const top = rect.bottom + POPOVER_OFFSET;
  // Right-anchor under the trigger so the menu opens toward the inside of
  // its container (matches the ColumnHeader / TaskCard alignment).
  const right = Math.max(8, window.innerWidth - rect.right);

  return { top, left: 0, right };
}

function ActionMenuComponent({
  items,
  triggerAriaLabel,
  className,
  triggerClassName,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const next = getPopoverPosition(triggerRef.current);

    setPopoverPosition((current) => {
      if (current && current.top === next.top && current.right === next.right) {
        return current;
      }

      return next;
    });
  }, []);

  const { schedule: schedulePositionUpdate, cancel: cancelPositionUpdate } =
    useRafThrottle(updatePopoverPosition);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen((value) => {
      if (value) {
        return false;
      }

      if (triggerRef.current) {
        setPopoverPosition(getPopoverPosition(triggerRef.current));
      }

      return true;
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePopoverPosition();

    const handleViewportChange = () => {
      schedulePositionUpdate();
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }

      close();
    };

    const handleKeyDown = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      cancelPositionUpdate();
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [
    cancelPositionUpdate,
    close,
    isOpen,
    schedulePositionUpdate,
    updatePopoverPosition,
  ]);

  // Focus the first non-disabled item when the menu opens.
  useEffect(() => {
    if (!isOpen || !popoverRef.current) {
      return;
    }

    const firstItem = popoverRef.current.querySelector<HTMLButtonElement>(
      "[data-action-menu-item]:not([disabled])",
    );

    firstItem?.focus();
  }, [isOpen]);

  const handleItemClick = useCallback(
    (item: ActionMenuItem) => {
      if (item.disabled) {
        return;
      }

      item.onSelect();
      close();
    },
    [close],
  );

  const popover =
    isOpen && popoverPosition
      ? createPortal(
          <div
            ref={popoverRef}
            className={styles.popover}
            id={menuId}
            role="menu"
            style={{
              top: `${popoverPosition.top}px`,
              right: `${popoverPosition.right}px`,
              minWidth: `${POPOVER_MIN_WIDTH}px`,
            }}
          >
            {items.map((item) => (
              <button
                key={item.key}
                data-action-menu-item="true"
                className={clsx(styles.item, {
                  [styles.itemDanger]: item.variant === "danger",
                })}
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                role="menuitem"
                type="button"
              >
                {item.icon ? (
                  <span aria-hidden="true" className={styles.icon}>
                    {item.icon}
                  </span>
                ) : null}
                <span className={styles.label}>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={clsx(styles.actionMenu, className)}>
      <button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerAriaLabel}
        className={clsx(styles.trigger, triggerClassName)}
        onClick={handleToggle}
        type="button"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>
      {popover}
    </div>
  );
}

export const ActionMenu = memo(ActionMenuComponent);
