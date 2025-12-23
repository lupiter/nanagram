interface SolutionStatusProps {
  message: string;
  className: string;
}

export default function SolutionStatus({ message, className }: SolutionStatusProps) {
  return (
    <div className={`solution-status ${className}`}>
      {message}
    </div>
  );
}

