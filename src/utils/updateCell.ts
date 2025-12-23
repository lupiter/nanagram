import { CellState as NonogramCellState, Hint, PuzzleSolutionData } from "../types/nonogram";
import { WorkingGrid, GameMode } from "../types/puzzle";
import { checkHints } from "./hintChecker";
import { isRowOrColumnComplete } from "./puzzleUtils";

export interface UpdateCellOptions {
  grid: WorkingGrid;
  puzzle: PuzzleSolutionData;
  row: number;
  col: number;
  toolToUse: NonogramCellState;
  mode: GameMode;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

export interface UpdateCellResult {
  newGrid: WorkingGrid;
  newRowHints: Hint[][];
  newColumnHints: Hint[][];
  errorCell: [number, number] | null;
}

export function updateCell(options: UpdateCellOptions): UpdateCellResult {
  const { grid, puzzle, row, col, toolToUse, mode, rowHints, columnHints } = options;
  const newGrid = grid.map(r => [...r]);
  const cell = newGrid[row][col];
  let errorCell: [number, number] | null = null;

  // In assisted mode, check if the move is valid
  if (
    mode === GameMode.Assisted &&
    toolToUse === NonogramCellState.FILLED &&
    puzzle[row][col] === NonogramCellState.EMPTY
  ) {
    // Invalid move - show error feedback
    errorCell = [row, col];
    // Cross out the cell instead
    newGrid[row][col] = NonogramCellState.CROSSED_OUT;
  } else {
    // Normal update logic
    if (cell === NonogramCellState.EMPTY || cell === toolToUse) {
      newGrid[row][col] =
        cell === toolToUse ? NonogramCellState.EMPTY : toolToUse;
    }
  }

  // Update row hints
  const newRowHints = [...rowHints];
  newRowHints[row] = checkHints(newGrid[row], newRowHints[row], puzzle[row]);

  // Update column hints
  const newColumnHints = [...columnHints];
  const column = newGrid.map(row => row[col]);
  const answerColumn = puzzle.map(row => row[col]);
  newColumnHints[col] = checkHints(column, newColumnHints[col], answerColumn);

  // In assisted mode, check if we need to auto-cross out cells
  if (mode === GameMode.Assisted) {
    // Check if the row is complete
    if (isRowOrColumnComplete(puzzle, newGrid, true, row)) {
      // Auto-cross out remaining empty cells in the row
      for (const [i, cell] of newGrid[row].entries()) {
        if (cell === NonogramCellState.EMPTY) {
          newGrid[row][i] = NonogramCellState.CROSSED_OUT;
        }
      }
    }

    // Check if the column is complete
    if (isRowOrColumnComplete(puzzle, newGrid, false, col)) {
      // Auto-cross out remaining empty cells in the column
      for (const [i, row] of newGrid.entries()) {
        if (row[col] === NonogramCellState.EMPTY) {
          newGrid[i][col] = NonogramCellState.CROSSED_OUT;
        }
      }
    }
  }

  return {
    newGrid,
    newRowHints,
    newColumnHints,
    errorCell
  };
}
