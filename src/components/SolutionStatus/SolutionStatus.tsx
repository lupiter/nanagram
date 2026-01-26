import DifficultyStars from '../DifficultyStars/DifficultyStars';
import StatusMessage from '../StatusMessage/StatusMessage';

type StatusVariant = 'info' | 'success' | 'error';

interface SolutionStatusProps {
  message: string;
  variant: StatusVariant;
  difficulty?: number | null;
}

export default function SolutionStatus({ message, variant, difficulty }: SolutionStatusProps) {
  return (
    <StatusMessage variant={variant} size="lg">
      {message}
      {difficulty != null && difficulty > 0 && (
        <span className="status-difficulty">
          <DifficultyStars difficulty={difficulty} size="medium" />
        </span>
      )}
    </StatusMessage>
  );
}

