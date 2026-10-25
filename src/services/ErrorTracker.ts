/**
 * ErrorTracker - Tracks and detects puzzle errors
 *
 * Detects:
 * - Clue Errors: Clues that cannot be satisfied with current state
 * - Completion Errors: Puzzles that cannot be completed from current state
 * - Cell Errors: Invalid cell markings
 */

import { CellState, PuzzleSolutionData, Hint } from "../types/nonogram";

export enum ErrorType {
  CELL = "cell",
  CLUE = "clue",
  COMPLETION = "completion",
}

export interface ClueError {
  type: ErrorType.CLUE;
  row: number;
  col: number;
  hintIndex: number;
  required: number;
  current: number;
  reason: string;
}

export interface CellError {
  type: ErrorType.CELL;
  row: number;
  col: number;
  current: CellState;
  expected: CellState;
  reason: string;
}

export interface CompletionError {
  type: ErrorType.COMPLETION;
  reason: string;
}

export type PuzzleError = CellError | ClueError | CompletionError;

export class ErrorTracker {
  private static instance: ErrorTracker | undefined;

  /** Get the singleton instance */
  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /** Calculate clue requirements and check if clue can be satisfied */
  calculateClueRequirements(
    rowOrCol: CellState[],
  ): { maxRequired: number; satisfied: number; unsatisfied: number } {
    let maxRequired = 0;
    let satisfied = 0;
    let currentRun = 0;

    for (const cell of rowOrCol) {
      if (cell === CellState.FILLED) {
        currentRun++;
      } else if (currentRun > 0) {
        // End of a run when we hit an empty cell
        maxRequired = Math.max(maxRequired, currentRun);
        satisfied++;
        currentRun = 0;
      }
    }

    // Handle trailing filled cells
    if (currentRun > 0) {
      maxRequired = Math.max(maxRequired, currentRun);
      satisfied++;
    }

    const unsatisfied = satisfied > 0 ? satisfied - 1 : 0;

    return { maxRequired, satisfied, unsatisfied };
  }

  /** Detect if a clue can be satisfied with current state */
  canClueBeSatisfied(
    rowOrCol: CellState[],
    clueIndex: number,
    requiredHints: (number | undefined)[],
  ): boolean {
    const clue = requiredHints[clueIndex];
    if (clue === undefined) return true; // No more clues to check

    // Quick check: if we don't have enough total filled cells, it's impossible
    const totalFilled = rowOrCol.filter((cell) => cell === CellState.FILLED).length;
    if (totalFilled < clue) {
      return false;
    }

    // Quick check: if we've exceeded the clue value anywhere, it's impossible
    let currentRun = 0;
    for (const cell of rowOrCol) {
      if (cell === CellState.FILLED) {
        currentRun++;
        if (currentRun > clue) {
          return false; // Exceeded the required count
        }
      } else {
        // Hit an empty cell - if we've found exactly the clue, we're done
        if (currentRun === clue) {
          return true;
        }
        currentRun = 0;
      }
    }

    // Check trailing run
    if (currentRun === clue) {
      return true;
    }

    // If we've filled more than the clue but not exactly, it's impossible
    if (currentRun > clue) {
      return false;
    }

    // Otherwise, we haven't yet reached the clue value - this is a valid state
    // We can't conclude it's unsatisfied yet because we haven't filled enough cells
    return true;
  }

  private hasMarkedCells(grid: CellState[][]): boolean {
    return grid.some((row) =>
      row.some((cell) => cell === CellState.FILLED || cell === CellState.CROSSED_OUT),
    );
  }

  /** Detect all Clue Errors in a grid */
  detectClueErrors(
    grid: CellState[][],
    rowHints: Hint[][],
    columnHints: Hint[][],
  ): ClueError[] {
    if (!this.hasMarkedCells(grid)) return [];
    const errors: ClueError[] = [];

    // Check row clues
    for (let row = 0; row < grid.length; row++) {
      const rowHintsArray = rowHints[row];
      if (!this.canClueBeSatisfied(grid[row], 0, rowHintsArray.map((h) => h.hint))) {
        errors.push({
          type: ErrorType.CLUE,
          row,
          col: -1,
          hintIndex: 0,
          required: rowHintsArray[0].hint,
          current: 0,
          reason: "Row clue cannot be satisfied with current state",
        } as ClueError);
      }
    }

    // Check column clues
    for (let col = 0; col < grid[0].length; col++) {
      const column = grid.map((row) => row[col]);
      const columnHintsArray = columnHints[col];
      if (!this.canClueBeSatisfied(column, 0, columnHintsArray.map((h) => h.hint))) {
        errors.push({
          type: ErrorType.CLUE,
          row: -1,
          col,
          hintIndex: 0,
          required: columnHintsArray[0].hint,
          current: 0,
          reason: "Column clue cannot be satisfied with current state",
        } as ClueError);
      }
    }

    return errors;
  }

  /** Detect if puzzle can be completed from current state */
  canPuzzleBeCompleted(
    grid: CellState[][],
    solution: PuzzleSolutionData,
  ): boolean {
    // Check if all unfilled cells in solution are marked
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cellState = grid[row][col];
        const expectedState = solution[row][col];

        if (expectedState === CellState.FILLED && cellState !== CellState.FILLED) {
          // Found an unfilled cell that should be filled
          return false;
        }

        if (expectedState === CellState.EMPTY && cellState === CellState.CROSSED_OUT) {
          // Found an incorrectly crossed-out cell
          return false;
        }
      }
    }

    return true;
  }

  /** Detect all Completion Errors */
  detectCompletionErrors(
    grid: CellState[][],
    solution: PuzzleSolutionData,
  ): CompletionError[] {
    const errors: CompletionError[] = [];

    if (!this.hasMarkedCells(grid)) return errors;

    if (!this.canPuzzleBeCompleted(grid, solution)) {
      errors.push({
        type: ErrorType.COMPLETION,
        reason: "Puzzle cannot be completed from current state. Some filled cells are marked incorrectly or empty cells are marked as crossed out.",
      } as CompletionError);
    }

    return errors;
  }

  /** Detect all cell errors (invalid markings) */
  detectCellErrors(
    grid: CellState[][],
    solution: PuzzleSolutionData,
  ): CellError[] {
    const errors: CellError[] = [];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cellState = grid[row][col];
        const expectedState = solution[row][col];

        // Check if cell is marked incorrectly
        if (cellState === CellState.FILLED && expectedState === CellState.EMPTY) {
          errors.push({
            type: ErrorType.CELL,
            row,
            col,
            current: cellState,
            expected: expectedState,
            reason: "Filled cell where solution expects empty",
          } as CellError);
        } else if (cellState === CellState.CROSSED_OUT) {
          // Check if crossed-out cell is in the wrong position
          if (expectedState === CellState.FILLED) {
            errors.push({
              type: ErrorType.CELL,
              row,
              col,
              current: cellState,
              expected: expectedState,
              reason: "Crossed-out cell where solution expects filled",
            } as CellError);
          } else {
            // expectedState must be CellState.EMPTY
            errors.push({
              type: ErrorType.CELL,
              row,
              col,
              current: cellState,
              expected: expectedState,
              reason: "Crossed-out cell where solution expects empty",
            } as CellError);
          }
        }
      }
    }

    return errors;
  }

  /** Detect all errors in a grid */
  detectErrors(
    grid: CellState[][],
    rowHints: Hint[][],
    columnHints: Hint[][],
    solution: PuzzleSolutionData,
  ): PuzzleError[] {
    return [
      ...this.detectCellErrors(grid, solution),
      ...this.detectClueErrors(grid, rowHints, columnHints),
      ...this.detectCompletionErrors(grid, solution),
    ];
  }

  /** Get error type counts */
  getErrorCounts(errors: PuzzleError[]): {
    cell: number;
    clue: number;
    completion: number;
  } {
    return {
      cell: errors.filter((e) => e.type === ErrorType.CELL).length,
      clue: errors.filter((e) => e.type === ErrorType.CLUE).length,
      completion: errors.filter((e) => e.type === ErrorType.COMPLETION).length,
    };
  }
}

/** Convenience export for the singleton instance */
export const errorTracker = ErrorTracker.getInstance();
