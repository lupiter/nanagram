import { PuzzleSolutionData, CellState } from "../../types/nonogram";
import "./SolutionPreview.css";

interface SolutionPreviewProps {
  solution: PuzzleSolutionData;
  maxSize?: number; // Maximum total size in pixels (default 200)
}

const roundToOneDecimal = (value: number) => {
  return Math.round(value * 10) / 10;
};

export default function SolutionPreview({ solution, maxSize = 200 }: SolutionPreviewProps) {
  const rows = solution.length;
  const cols = solution[0]?.length ?? rows;
  const cellSize = Math.max(2, roundToOneDecimal(maxSize / Math.max(rows, cols)));

  return (
    <div 
      className="solution-preview"
      style={{
        gridTemplateColumns: `repeat(${String(cols)}, ${String(cellSize)}px)`,
        gridTemplateRows: `repeat(${String(rows)}, ${String(cellSize)}px)`,
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

