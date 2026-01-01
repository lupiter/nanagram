import { produce } from "immer";
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
  let errorCell: [number, number] | null = null;

  const newGrid = produce(grid, draft => {
    const cell = draft[row][col];

    // In assisted mode, check if the move is valid
    if (
      mode === GameMode.Assisted &&
      toolToUse === NonogramCellState.FILLED &&
      puzzle[row][col] === NonogramCellState.EMPTY
    ) {
      // Invalid move - show error feedback
      errorCell = [row, col];
      // Cross out the cell instead
      draft[row][col] = NonogramCellState.CROSSED_OUT;
    } else {
      // Normal update logic
      if (cell === NonogramCellState.EMPTY || cell === toolToUse) {
        draft[row][col] = cell === toolToUse ? NonogramCellState.EMPTY : toolToUse;
      }
    }

    // In assisted mode, check if we need to auto-cross out cells
    if (mode === GameMode.Assisted) {
      // Check if the row is complete
      if (isRowOrColumnComplete(puzzle, draft, true, row)) {
        // Auto-cross out remaining empty cells in the row
        for (let i = 0; i < draft[row].length; i++) {
          if (draft[row][i] === NonogramCellState.EMPTY) {
            draft[row][i] = NonogramCellState.CROSSED_OUT;
          }
        }
      }

      // Check if the column is complete
      if (isRowOrColumnComplete(puzzle, draft, false, col)) {
        // Auto-cross out remaining empty cells in the column
        for (const [i, rowData] of draft.entries()) {
          if (rowData[col] === NonogramCellState.EMPTY) {
            draft[i][col] = NonogramCellState.CROSSED_OUT;
          }
        }
      }
    }
  });

  // Update row hints
  const newRowHints = produce(rowHints, draft => {
    draft[row] = checkHints(newGrid[row], draft[row], puzzle[row]);
  });

  // Update column hints
  const newColumnHints = produce(columnHints, draft => {
    const column = newGrid.map(r => r[col]);
    const answerColumn = puzzle.map(r => r[col]);
    draft[col] = checkHints(column, draft[col], answerColumn);
  });

  return {
    newGrid,
    newRowHints,
    newColumnHints,
    errorCell
  };
}
