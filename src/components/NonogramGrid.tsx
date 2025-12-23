import { CellState, Hint } from "../types/nonogram";
import HintDisplay from "./HintDisplay";
import "./NonogramGrid.css";

export interface NonogramGridProps {
  grid: number[][];
  rowHints: Hint[][];
  columnHints: Hint[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseDown?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  errorCell?: [number, number] | null;
}

export default function NonogramGrid({
  grid,
  rowHints,
  columnHints,
  onCellClick,
  onCellRightClick,
  onCellMouseDown,
  onCellMouseEnter,
  errorCell,
}: NonogramGridProps) {
  return (
    <table className="nonogram-grid" role="grid">
      <thead>
        <tr>
          <th></th>
          {columnHints.map((hints, colIndex) => (
            <th key={colIndex} role="columnheader">
              <HintDisplay hints={hints} isVertical={true} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex} role="row">
            <th role="rowheader">
              <HintDisplay hints={rowHints[rowIndex]} isVertical={false} />
            </th>
            {row.map((cell, colIndex) => (
              <td key={`${rowIndex}-${colIndex}`} role="gridcell">
                <input
                  type="checkbox"
                  id={`cell-${rowIndex}-${colIndex}`}
                  checked={cell === CellState.FILLED}
                  onChange={() => onCellClick(rowIndex, colIndex)}
                  onContextMenu={
                    onCellRightClick
                      ? (e) => onCellRightClick(rowIndex, colIndex, e)
                      : undefined
                  }
                  onMouseDown={
                    onCellMouseDown
                      ? (e) => onCellMouseDown(rowIndex, colIndex, e)
                      : undefined
                  }
                  onMouseEnter={
                    onCellMouseEnter
                      ? () => onCellMouseEnter(rowIndex, colIndex)
                      : undefined
                  }
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = cell === CellState.EMPTY;
                    }
                  }}
                  className={
                    errorCell &&
                    errorCell[0] === rowIndex &&
                    errorCell[1] === colIndex
                      ? "shake"
                      : ""
                  }
                  aria-label={`Cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

