import { ReactNode } from "react";
import clsx from "clsx";
import "./StatusMessage.css";

type Variant = "info" | "success" | "warning" | "error";
type Size = "sm" | "md" | "lg";

interface StatusMessageProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

export default function StatusMessage({
  children,
  variant = "info",
  size = "md",
  className,
}: StatusMessageProps) {
  const classes = clsx(
    "status-message",
    `status-message-${variant}`,
    size !== "md" && `status-message-${size}`,
    className
  );

  return <div className={classes}>{children}</div>;
}
