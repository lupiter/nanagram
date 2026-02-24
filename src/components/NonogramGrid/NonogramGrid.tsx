import { useMemo, type CSSProperties } from "react";
import { CellState } from "../../types/nonogram";
import { NonogramGridProps } from "../../types/puzzle";
import HintDisplay from "../HintDisplay/HintDisplay";
import "./NonogramGrid.css";

export default function NonogramGrid({
  grid,
  rowHints,
  columnHints,
  onCellClick,
  onCellRightClick,
  onCellPointerDown,
  onCellPointerEnter,
  errorCell,
  minRowHintSlots,
  minColHintSlots,
}: NonogramGridProps) {
  const hintDimensions = useMemo(() => {
    const maxRowHints = rowHints.length > 0
      ? Math.max(...rowHints.map((h) => h.length))
      : 0;
    const maxColHints = columnHints.length > 0
      ? Math.max(...columnHints.map((h) => h.length))
      : 0;
    return { maxRowHints, maxColHints };
  }, [rowHints, columnHints]);

  const containerStyle = useMemo(
    (): CSSProperties => ({
      "--max-row-hints": String(
        Math.max(1, hintDimensions.maxRowHints, minRowHintSlots ?? 0)
      ),
      "--max-col-hints": String(
        Math.max(1, hintDimensions.maxColHints, minColHintSlots ?? 0)
      ),
    } as CSSProperties),
    [hintDimensions, minRowHintSlots, minColHintSlots]
  );

  return (
    <div className="nonogram-grid-container" style={containerStyle}>
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
                <td
                  key={`${String(rowIndex)}-${String(colIndex)}`}
                  role="gridcell"
                  onPointerEnter={
                    onCellPointerEnter
                      ? () => {
                          onCellPointerEnter(rowIndex, colIndex);
                        }
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    id={`cell-${String(rowIndex)}-${String(colIndex)}`}
                    checked={cell === (CellState.FILLED as number)}
                    onChange={() => {
                      onCellClick(rowIndex, colIndex);
                    }}
                    onContextMenu={
                      onCellRightClick
                        ? (e) => {
                            onCellRightClick(rowIndex, colIndex, e);
                          }
                        : undefined
                    }
                    onPointerDown={
                      onCellPointerDown
                        ? (e) => {
                            onCellPointerDown(rowIndex, colIndex, e);
                          }
                        : undefined
                    }
                    ref={(input) => {
                      if (input) {
                        input.indeterminate =
                          cell === (CellState.EMPTY as number);
                      }
                    }}
                    className={
                      errorCell &&
                      errorCell[0] === rowIndex &&
                      errorCell[1] === colIndex
                        ? "shake"
                        : ""
                    }
                    aria-label={`Cell at row ${String(
                      rowIndex + 1
                    )}, column ${String(colIndex + 1)}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
