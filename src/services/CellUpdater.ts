/**
 * CellUpdater - Handles cell updates in the puzzle game
 */
import { produce } from "immer";
import { CellState, GameState, Hint } from "../types/nonogram";
import { GameMode, UpdateCellOptions, UpdateCellResult } from "../types/puzzle";
import { hintChecker } from "./HintChecker";
import { puzzleService } from "./Puzzle";

/**
 * CellUpdater - Singleton for updating cells
 */
export class CellUpdater {
  private static instance: CellUpdater | undefined;

  static getInstance(): CellUpdater {
    if (!CellUpdater.instance) {
      CellUpdater.instance = new CellUpdater();
    }
    return CellUpdater.instance;
  }

  /** Update a cell and return the new state */
  update(options: UpdateCellOptions): UpdateCellResult {
    const { grid, solution, row, col, toolToUse, mode, rowHints, columnHints } =
      options;
    let errorCell: [number, number] | null = null;

    const newGrid = produce(grid, (draft: GameState) => {
      // free mode: do whatever
      if (mode === GameMode.Free) {
        draft[row][col] = toolToUse;
        return;
      }

      const current = draft[row][col];
      if (current === CellState.FILLED) {
        return;
      }

      // fix wrong fills (cell should be empty)
      if (
        toolToUse === CellState.FILLED &&
        solution[row][col] === CellState.EMPTY
      ) {
        // Invalid move - show error feedback
        errorCell = [row, col];
        // Cross out the cell instead
        draft[row][col] = CellState.CROSSED_OUT;
      } else {
        draft[row][col] = current === toolToUse ? CellState.EMPTY : toolToUse;
      }

      // Assisted only: auto-cross when row/column complete
      if (mode === GameMode.Assisted) {
        // Check if the row is complete
        if (puzzleService.isRowOrColumnComplete(solution, draft, true, row)) {
          // Auto-cross out remaining empty cells in the row
          for (let i = 0; i < draft[row].length; i++) {
            if (i === col) continue; // Skip the cell we just updated
            if (draft[row][i] === CellState.EMPTY) {
              draft[row][i] = CellState.CROSSED_OUT;
            }
          }
        }

        // Check if the column is complete
        if (puzzleService.isRowOrColumnComplete(solution, draft, false, col)) {
          // Auto-cross out remaining empty cells in the column
          for (let i = 0; i < draft.length; i++) {
            if (i === row) continue; // Skip the cell we just updated
            if (draft[i][col] === CellState.EMPTY) {
              draft[i][col] = CellState.CROSSED_OUT;
            }
          }
        }
      }
    });

    // Update row hints
    const newRowHints = produce(rowHints, (draft: Hint[][]) => {
      draft[row] = hintChecker.check(newGrid[row], draft[row], solution[row]);
    });

    // Update column hints
    const newColumnHints = produce(columnHints, (draft: Hint[][]) => {
      const column = newGrid.map((r) => r[col]);
      const answerColumn = solution.map((r) => r[col]);
      draft[col] = hintChecker.check(column, draft[col], answerColumn);
    });

    return {
      newGrid,
      newRowHints,
      newColumnHints,
      errorCell,
    };
  }
}

/** Convenience export for the singleton instance */
export const cellUpdater = CellUpdater.getInstance();
