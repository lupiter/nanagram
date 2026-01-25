import clsx from "clsx";
import "./CardGrid.css";

interface CardGridProps {
  children: React.ReactNode;
  minCardWidth?: number;
  className?: string;
}

export default function CardGrid({
  children,
  minCardWidth = 120,
  className,
}: CardGridProps) {
  return (
    <div
      className={clsx('card-grid', className)}
      style={{ "--card-min-width": `${String(minCardWidth)}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
