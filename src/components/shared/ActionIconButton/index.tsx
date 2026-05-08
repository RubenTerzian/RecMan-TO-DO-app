import type { ComponentProps, SVGProps } from "react";
import { IconButton } from "@/components/atoms/IconButton";
import { clsx } from "@/utils/clsx";
import styles from "./ActionIconButton.module.css";

type BaseActionIconButtonProps = ComponentProps<typeof IconButton>;

type ActionIconButtonProps = Omit<BaseActionIconButtonProps, "children"> & {
  className?: string;
};

type IconProps = SVGProps<SVGSVGElement>;

function EditIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 7 17 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 7h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4h3c.83 0 1.5.67 1.5 1.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10v7.5c0 .83.67 1.5 1.5 1.5h5c.83 0 1.5-.67 1.5-1.5V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 11.5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 11.5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CancelIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 7l10 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SaveIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.5 12.5 10 16l7.5-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BaseActionIconButton({
  className,
  type = "button",
  ...props
}: BaseActionIconButtonProps) {
  return (
    <IconButton
      className={clsx(styles.actionIconButton, className)}
      type={type}
      {...props}
    />
  );
}

export function EditIconButton({ className, ...props }: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.edit, className)} {...props}>
      <EditIcon className={styles.icon} />
    </BaseActionIconButton>
  );
}

export function DeleteIconButton({
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.delete, className)} {...props}>
      <DeleteIcon className={styles.icon} />
    </BaseActionIconButton>
  );
}

export function CancelIconButton({
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.cancel, className)} {...props}>
      <CancelIcon className={styles.icon} />
    </BaseActionIconButton>
  );
}

export function SaveIconButton({ className, ...props }: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.save, className)} {...props}>
      <SaveIcon className={styles.icon} />
    </BaseActionIconButton>
  );
}
