import { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "default" | "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  square?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "default",
  square = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "btn",
    `btn-${variant}`,
    square && "btn-square",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
