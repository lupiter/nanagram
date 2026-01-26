import { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./LinkCard.css";

type Size = "sm" | "md" | "lg";

interface LinkCardProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  size?: Size;
  column?: boolean;
  className?: string;
  title?: string;
}

export default function LinkCard({
  to,
  children,
  icon,
  size = "lg",
  column = false,
  className,
  title,
}: LinkCardProps) {
  const classes = clsx(
    "link-card",
    size !== "lg" && `link-card-${size}`,
    { "link-card-column": column },
    className
  );

  return (
    <Link to={to} className={classes} title={title}>
      {icon && <span className="link-card-icon">{icon}</span>}
      <span className="link-card-text">{children}</span>
    </Link>
  );
}
