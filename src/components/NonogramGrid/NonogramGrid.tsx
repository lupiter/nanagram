import { useMemo, type CSSProperties } from "react";
import { NonogramGridProps } from "../../types/puzzle";
import NonogramCell from "../NonogramCell/NonogramCell";
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
    const maxRowHints =
      rowHints.length > 0 ? Math.max(...rowHints.map((h) => h.length)) : 0;
    const maxColHints =
      columnHints.length > 0
        ? Math.max(...columnHints.map((h) => h.length))
        : 0;
    return { maxRowHints, maxColHints };
  }, [rowHints, columnHints]);

  const containerStyle = useMemo(
    (): CSSProperties =>
      ({
        "--max-row-hints": String(
          Math.max(1, hintDimensions.maxRowHints, minRowHintSlots ?? 0),
        ),
        "--max-col-hints": String(
          Math.max(1, hintDimensions.maxColHints, minColHintSlots ?? 0),
        ),
      }) as CSSProperties,
    [hintDimensions, minRowHintSlots, minColHintSlots],
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
                <NonogramCell
                  key={`${String(rowIndex)}-${String(colIndex)}`}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onCellClick={onCellClick}
                  onCellRightClick={onCellRightClick}
                  onCellPointerDown={onCellPointerDown}
                  onCellPointerEnter={onCellPointerEnter}
                  errorCell={errorCell}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
