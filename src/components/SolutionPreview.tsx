import { PuzzleSolutionData, CellState } from "../types/nonogram";
import "./SolutionPreview.css";

interface SolutionPreviewProps {
  solution: PuzzleSolutionData;
  maxSize?: number; // Maximum total size in pixels (default 200)
}

export default function SolutionPreview({ solution, maxSize = 200 }: SolutionPreviewProps) {
  const gridSize = solution.length;
  const cellSize = Math.max(2, Math.floor(maxSize / gridSize));

  return (
    <div 
      className="solution-preview"
      style={{
        gridTemplateColumns: `repeat(${String(gridSize)}, ${String(cellSize)}px)`,
        gridTemplateRows: `repeat(${String(gridSize)}, ${String(cellSize)}px)`,
      }}
    >
      {solution.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${String(rowIndex)}-${String(colIndex)}`}
            className={cell === CellState.FILLED ? "cell filled" : "cell"}
          />
        ))
      )}
    </div>
  );
}

