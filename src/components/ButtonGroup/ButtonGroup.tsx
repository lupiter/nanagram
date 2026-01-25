import { ReactNode } from "react";
import clsx from "clsx";
import "./ButtonGroup.css";

type Gap = 1 | 2 | 3 | 4 | 6;
type Justify = "center" | "between" | "start" | "end";
type Align = "center" | "start" | "end";

interface ButtonGroupProps {
  children: ReactNode;
  gap?: Gap;
  justify?: Justify;
  align?: Align;
  wrap?: boolean;
  column?: boolean;
  className?: string;
}

export default function ButtonGroup({
  children,
  gap = 2,
  justify,
  align,
  wrap = false,
  column = false,
  className,
}: ButtonGroupProps) {
  const classes = clsx(
    "button-group",
    `button-group-gap-${String(gap)}`,
    justify && `button-group-justify-${justify}`,
    align && `button-group-align-${align}`,
    {
      "button-group-wrap": wrap,
      "button-group-column": column,
    },
    className
  );

  return <div className={classes}>{children}</div>;
}
