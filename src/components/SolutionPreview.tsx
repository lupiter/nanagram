import { PuzzleSolutionData, CellState } from "../types/nonogram";
import "./SolutionPreview.css";

interface SolutionPreviewProps {
  solution: PuzzleSolutionData;
}

export default function SolutionPreview({ solution }: SolutionPreviewProps) {
  const size = solution.length;
  const cellSize = Math.min(20, Math.floor(200 / size));

  return (
    <div 
      className="solution-preview"
      style={{
        gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
      }}
    >
      {solution.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cell === CellState.FILLED ? "cell filled" : "cell"}
          />
        ))
      )}
    </div>
  );
}

