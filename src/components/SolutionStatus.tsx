import DifficultyStars from './DifficultyStars';

interface SolutionStatusProps {
  message: string;
  className: string;
  difficulty?: number | null;
}

export default function SolutionStatus({ message, className, difficulty }: SolutionStatusProps) {
  return (
    <div className={`solution-status ${className}`}>
      {message}
      {difficulty != null && difficulty > 0 && (
        <span className="status-difficulty">
          <DifficultyStars difficulty={difficulty} size="medium" />
        </span>
      )}
    </div>
  );
}

