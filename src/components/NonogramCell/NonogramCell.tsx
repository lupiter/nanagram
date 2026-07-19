import { useRef, useEffect } from "react";
import { CellState } from "../../types/nonogram";

export default function NonogramCell({
  cell,
  rowIndex,
  colIndex,
  onCellClick,
  onCellRightClick,
  errorCell,
}: {
  cell: CellState;
  rowIndex: number;
  colIndex: number;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number, e: React.MouseEvent) => void;
  errorCell?: [number, number] | null;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = cell === CellState.EMPTY;
      ref.current.checked = cell === CellState.FILLED;
    }
  }, [cell, ref]);

  return (
    <td key={`${String(rowIndex)}-${String(colIndex)}`} role="gridcell">
      <input
        type="checkbox"
        id={`cell-${String(rowIndex)}-${String(colIndex)}`}
        checked={cell === CellState.FILLED}
        onChange={() => {
          onCellClick(rowIndex, colIndex);
        }}
        onContextMenu={(e) => {
          onCellRightClick(rowIndex, colIndex, e);
        }}
        ref={ref}
        className={
          errorCell && errorCell[0] === rowIndex && errorCell[1] === colIndex
            ? "shake"
            : ""
        }
        aria-label={`Cell at row ${String(
          rowIndex + 1,
        )}, column ${String(colIndex + 1)}`}
      />
    </td>
  );
}
