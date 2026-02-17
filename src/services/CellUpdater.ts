/**
 * CellUpdater - Handles cell updates in the puzzle game
 */

import { produce } from "immer";
import { CellState } from "../types/nonogram";
import type { Hint } from "../types/nonogram";
import { GameMode, UpdateCellOptions, UpdateCellResult } from "../types/puzzle";
import { hintChecker } from "./HintChecker";
import { puzzleService } from "./Puzzle";

function findFilledBlocks(line: number[]): { start: number; length: number }[] {
  const blocks: { start: number; length: number }[] = [];
  let start = -1;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === CellState.FILLED) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      blocks.push({ start, length: i - start });
      start = -1;
    }
  }
  if (start !== -1) blocks.push({ start, length: line.length - start });
  return blocks;
}

/**
 * In assisted mode, add a cross before a block at the end or after a block at the start
 * when the block matches the last or first k clue(s).
 */
function addBoundaryCrosses(
  line: number[],
  hints: Hint[],
  setCell: (index: number, value: number) => void
): void {
  if (hints.length === 0) return;
  const blocks = findFilledBlocks(line);
  if (blocks.length === 0) return;

  const last = blocks[blocks.length - 1];
  if (last.start + last.length === line.length) {
    let sum = 0;
    for (let k = 1; k <= hints.length; k++) {
      sum += hints[hints.length - k].hint;
      if (sum === last.length && last.start > 0 && line[last.start - 1] === CellState.EMPTY) {
        setCell(last.start - 1, CellState.CROSSED_OUT);
        break;
      }
      if (sum > last.length) break;
    }
  }

  const first = blocks[0];
  if (first.start === 0) {
    let sum = 0;
    for (let k = 0; k < hints.length; k++) {
      sum += hints[k].hint;
      if (sum === first.length) {
        const idx = first.length;
        if (idx < line.length && line[idx] === CellState.EMPTY) {
          setCell(idx, CellState.CROSSED_OUT);
        }
        break;
      }
      if (sum > first.length) break;
    }
  }
}

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

      // Assisted and Correction: fix wrong fills (cell should be empty)
      if (
        (mode === GameMode.Assisted || mode === GameMode.Correction) &&
        toolToUse === CellState.FILLED &&
        puzzle[row][col] === CellState.EMPTY
      ) {
        // Invalid move - show error feedback
        errorCell = [row, col];
        // Cross out the cell instead
        draft[row][col] = CellState.CROSSED_OUT;
      } else {
        // Assisted only: do not allow changing filled cells (no un-fill, no fill→cross)
        if (mode === GameMode.Assisted && cell === CellState.FILLED) {
          // No-op: keep cell filled
        } else if (
          (mode === GameMode.Assisted || mode === GameMode.Correction) &&
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

      // Assisted only: auto-cross when row/column complete and boundary crosses
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

        // Auto-add boundary crosses: cross before block at end, or after block at start, when block matches clues
        const rowLine = draft[row] as number[];
        addBoundaryCrosses(rowLine, rowHints[row], j => {
          if (draft[row][j] === CellState.EMPTY) draft[row][j] = CellState.CROSSED_OUT;
        });
        const colLine = draft.map(r => r[col]) as number[];
        addBoundaryCrosses(colLine, columnHints[col], i => {
          if (draft[i][col] === CellState.EMPTY) draft[i][col] = CellState.CROSSED_OUT;
        });
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
