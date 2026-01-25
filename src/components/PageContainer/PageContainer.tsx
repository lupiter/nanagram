import clsx from "clsx";
import "./PageContainer.css";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg";
}

export default function PageContainer({
  children,
  className,
  maxWidth = "md",
}: PageContainerProps) {
  const containerClass = clsx('page-container', `page-container-${maxWidth}`, className);

  return <div className={containerClass}>{children}</div>;
}
