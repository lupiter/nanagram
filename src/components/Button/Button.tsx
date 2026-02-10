import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import "./Button.css";

type ButtonVariant = "default" | "primary" | "secondary" | "danger";

interface BaseButtonProps {
  variant?: ButtonVariant;
  square?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: never;
    to?: never;
  };

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
    to?: never;
  };

type ButtonAsRouterLink = BaseButtonProps & {
  to: string;
  href?: never;
  title?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsRouterLink;

export default function Button({
  variant = "default",
  square = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = clsx(
    "btn",
    `btn-${variant}`,
    { "btn-square": square },
    className
  );

  // Router Link
  if ("to" in props && props.to) {
    const { to, title, ...rest } = props as ButtonAsRouterLink;
    return (
      <Link to={to} className={classes} title={title} {...rest}>
        {children}
      </Link>
    );
  }

  // External link
  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  // Regular button
  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
