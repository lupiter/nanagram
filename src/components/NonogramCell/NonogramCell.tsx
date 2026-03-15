import { useRef, useEffect } from "react";
import { CellState } from "../../types/nonogram";

export default function NonogramGrid({
  cell,
  rowIndex,
  colIndex,
  onCellClick,
  onCellRightClick,
  onCellPointerDown,
  onCellPointerEnter,
  errorCell,
}: {
  cell: CellState;
  rowIndex: number;
  colIndex: number;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number, e: React.MouseEvent) => void;
  onCellPointerDown: (row: number, col: number, e: React.PointerEvent) => void;
  onCellPointerEnter: (row: number, col: number) => void;
  errorCell?: [number, number] | null;
}) {
  const onGestureStart = (e: Event) => {
    e.preventDefault();
  };
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = cell === CellState.EMPTY;
      ref.current.checked = cell === CellState.FILLED;
      ref.current.addEventListener("gesturestart", onGestureStart);
    }
  }, [cell, ref]);

  return (
    <td
      key={`${String(rowIndex)}-${String(colIndex)}`}
      role="gridcell"
      onPointerEnter={() => {
        onCellPointerEnter(rowIndex, colIndex);
      }}
    >
      <input
        type="checkbox"
        id={`cell-${String(rowIndex)}-${String(colIndex)}`}
        checked={cell === CellState.FILLED}
        onChange={() => {
          onCellClick(rowIndex, colIndex);
        }}
        onPointerDown={(e) => {
          onCellPointerDown(rowIndex, colIndex, e);
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
