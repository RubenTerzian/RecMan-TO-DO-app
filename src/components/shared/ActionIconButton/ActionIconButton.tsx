import type { ComponentProps, SVGProps } from "react";
import { memo } from "react";
import { IconButton } from "@/components/atoms/IconButton/IconButton";
import { clsx } from "@/utils/clsx";
import styles from "./ActionIconButton.module.css";

type BaseActionIconButtonProps = ComponentProps<typeof IconButton>;

type ActionIconButtonProps = Omit<
  BaseActionIconButtonProps,
  "children" | "aria-label"
> & {
  "aria-label": string;
  className?: string;
};

type BaseButtonProps = ActionIconButtonProps & {
  children: BaseActionIconButtonProps["children"];
};

type IconProps = SVGProps<SVGSVGElement>;

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
}: BaseButtonProps) {
  return (
    <IconButton
      className={clsx(styles.actionIconButton, className)}
      type={type}
      {...props}
    />
  );
}

export const CancelIconButton = memo(function CancelIconButton({
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.cancel, className)} {...props}>
      <CancelIcon className={styles.icon} />
    </BaseActionIconButton>
  );
});

export const SaveIconButton = memo(function SaveIconButton({
  className,
  ...props
}: ActionIconButtonProps) {
  return (
    <BaseActionIconButton className={clsx(styles.save, className)} {...props}>
      <SaveIcon className={styles.icon} />
    </BaseActionIconButton>
  );
});
