/**
 * CellUpdater - Handles cell updates in the puzzle game
 */

import { produce } from "immer";
import { CellState } from "../types/nonogram";
import { GameMode, UpdateCellOptions, UpdateCellResult } from "../types/puzzle";
import { hintChecker } from "./HintChecker";
import { puzzleService } from "./Puzzle";

/**
 * CellUpdater - Singleton for updating cells
 */
export class CellUpdater {
  private static instance: CellUpdater;

  static getInstance(): CellUpdater {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    CellUpdater.instance ??= new CellUpdater();
    return CellUpdater.instance;
  }

  /** Update a cell and return the new state */
  update(options: UpdateCellOptions): UpdateCellResult {
    const { grid, puzzle, row, col, toolToUse, mode, rowHints, columnHints } = options;
    let errorCell: [number, number] | null = null;

    const newGrid = produce(grid, draft => {
      const cell = draft[row][col];

      // In assisted mode, check if the move is valid
      if (
        mode === GameMode.Assisted &&
        toolToUse === CellState.FILLED &&
        puzzle[row][col] === CellState.EMPTY
      ) {
        // Invalid move - show error feedback
        errorCell = [row, col];
        // Cross out the cell instead
        draft[row][col] = CellState.CROSSED_OUT;
      } else {
        // Assisted mode: do not allow changing filled cells (no un-fill, no fill→cross)
        if (mode === GameMode.Assisted && cell === CellState.FILLED) {
          // No-op: keep cell filled
        } else if (
          mode === GameMode.Assisted &&
          cell === CellState.CROSSED_OUT &&
          toolToUse === CellState.CROSSED_OUT
        ) {
          // Assisted mode: always allow un-cross if the cross is wrong (solution says filled)
          const solutionCell = puzzle[row][col];
          if (solutionCell === CellState.FILLED) {
            draft[row][col] = CellState.EMPTY;
          } else {
            // Correct cross: allow un-cross only if row and column are not complete
            const rowComplete = puzzleService.isRowOrColumnComplete(puzzle, draft, true, row);
            const colComplete = puzzleService.isRowOrColumnComplete(puzzle, draft, false, col);
            if (!rowComplete && !colComplete) {
              draft[row][col] = CellState.EMPTY;
            }
          }
        } else if (cell === CellState.EMPTY || cell === toolToUse) {
          // Normal update logic
          draft[row][col] = cell === toolToUse ? CellState.EMPTY : toolToUse;
        }
      }

      // In assisted mode, check if we need to auto-cross out cells
      if (mode === GameMode.Assisted) {
        // Check if the row is complete
        if (puzzleService.isRowOrColumnComplete(puzzle, draft, true, row)) {
          // Auto-cross out remaining empty cells in the row
          for (let i = 0; i < draft[row].length; i++) {
            if (draft[row][i] === CellState.EMPTY) {
              draft[row][i] = CellState.CROSSED_OUT;
            }
          }
        }

        // Check if the column is complete
        if (puzzleService.isRowOrColumnComplete(puzzle, draft, false, col)) {
          // Auto-cross out remaining empty cells in the column
          for (const [i, rowData] of draft.entries()) {
            if (rowData[col] === CellState.EMPTY) {
              draft[i][col] = CellState.CROSSED_OUT;
            }
          }
        }
      }
    });

    // Update row hints
    const newRowHints = produce(rowHints, draft => {
      draft[row] = hintChecker.check(newGrid[row], draft[row], puzzle[row]);
    });

    // Update column hints
    const newColumnHints = produce(columnHints, draft => {
      const column = newGrid.map(r => r[col]);
      const answerColumn = puzzle.map(r => r[col]);
      draft[col] = hintChecker.check(column, draft[col], answerColumn);
    });

    return {
      newGrid,
      newRowHints,
      newColumnHints,
      errorCell
    };
  }
}

/** Convenience export for the singleton instance */
export const cellUpdater = CellUpdater.getInstance();
