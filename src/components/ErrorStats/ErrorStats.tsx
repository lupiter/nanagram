import { useMemo } from "react";
import { ErrorType, PuzzleError } from "../../services/ErrorTracker";
import "./ErrorStats.css";

interface ErrorStatsProps {
  errors: PuzzleError[];
}

export default function ErrorStats({ errors }: ErrorStatsProps) {
  const counts = useMemo(() => {
    return {
      cell: errors.filter((e) => e.type === ErrorType.CELL).length,
      clue: errors.filter((e) => e.type === ErrorType.CLUE).length,
      completion: errors.filter((e) => e.type === ErrorType.COMPLETION).length,
    };
  }, [errors]);

  const hasErrors = counts.cell > 0 || counts.clue > 0 || counts.completion > 0;

  if (!hasErrors) return null;

  return (
    <div className="error-stats">
      <div className="error-stats-header">Errors Found</div>
      <div className="error-stats-grid">
        {counts.cell > 0 && (
          <div className="error-stats-item cell">
            <span className="error-count">{counts.cell}</span>
            <span className="error-label">Cell</span>
          </div>
        )}
        {counts.clue > 0 && (
          <div className="error-stats-item clue">
            <span className="error-count">{counts.clue}</span>
            <span className="error-label">Clue</span>
          </div>
        )}
        {counts.completion > 0 && (
          <div className="error-stats-item completion">
            <span className="error-count">{counts.completion}</span>
            <span className="error-label">Puzzle</span>
          </div>
        )}
      </div>
    </div>
  );
}
