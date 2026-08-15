/**
 * ErrorTracker - Tracks and detects puzzle errors
 *
 * Detects:
 * - Clue Errors: Clues that cannot be satisfied with current state
 * - Completion Errors: Puzzles that cannot be completed from current state
 * - Cell Errors: Invalid cell markings
 */

import { CellState, PuzzleSolutionData } from "../types/nonogram";

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

export interface CellError {
  type: ErrorType.CELL;
  row: number;
  col: number;
  current: CellState;
  expected: CellState;
  reason: string;
}

export type PuzzleError = CellError | ClueError | CompletionError;

export class ErrorTracker {
  private static instance: ErrorTracker;

  /** Get the singleton instance */
  static getInstance(): ErrorTracker {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ErrorTracker.instance ??= new ErrorTracker();
    return ErrorTracker.instance;
  }

  /** Calculate clue requirements and check if clue can be satisfied */
  calculateClueRequirements(
    rowOrCol: number[],
    _isRow: boolean,
  ): { maxRequired: number; satisfied: number; unsatisfied: number } {
    let maxRequired = 0;
    let satisfied = 0;
    let currentRun = 0;

    for (let i = 0; i < rowOrCol.length; i++) {
      const cell = rowOrCol[i];
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

    // Count unsatisfied clues (simplified: treat as not satisfied if multiple clues exist)
    const unsatisfied = Math.max(0, satisfied - 1);

    return { maxRequired, satisfied, unsatisfied };
  }

  /** Detect if a clue can be satisfied with current state */
  canClueBeSatisfied(
    rowOrCol: number[],
    _isRow: boolean,
    clueIndex: number,
    requiredHints: number[],
  ): boolean {
    const clue = requiredHints[clueIndex];
    if (clue === undefined) return true; // No more clues to check

    let currentRun = 0;

    for (let i = 0; i < rowOrCol.length; i++) {
      const cell = rowOrCol[i];

      if (cell === CellState.FILLED) {
        currentRun++;
        // If we exceed the clue value, we can't satisfy this clue
        if (currentRun > clue) {
          return false;
        }
      } else {
        // Hit an empty cell
        if (currentRun === clue) {
          // We found exactly the clue value
          return true;
        } else if (currentRun > clue) {
          // We found more than the clue value
          return false;
        } else {
          // currentRun < clue, continue looking
          currentRun = 0;
        }
      }
    }

    // Check trailing run
    if (currentRun === clue) {
      // We found exactly the clue value at the end
      return true;
    } else if (currentRun > clue) {
      return false;
    } else {
      // currentRun < clue, not enough filled cells
      return false;
    }
  }

  /** Detect all Clue Errors in a grid */
  detectClueErrors(
    grid: number[][],
    rowHints: number[][],
    columnHints: number[][],
  ): ClueError[] {
    const errors: ClueError[] = [];

    // Check row clues
    for (let row = 0; row < grid.length; row++) {
      const rowHintsArray = rowHints[row];
      if (rowHintsArray && !this.canClueBeSatisfied(grid[row], true, 0, rowHintsArray)) {
        errors.push({
          type: ErrorType.CLUE,
          row,
          col: -1,
          hintIndex: 0,
          required: rowHintsArray?.[0] || 0,
          current: 0,
          reason: "Row clue cannot be satisfied with current state",
        });
      }
    }

    // Check column clues
    for (let col = 0; col < grid[0].length; col++) {
      const column = grid.map((row) => row[col]);
      const columnHintsArray = columnHints[col];
      if (columnHintsArray && !this.canClueBeSatisfied(column, false, 0, columnHintsArray)) {
        errors.push({
          type: ErrorType.CLUE,
          row: -1,
          col,
          hintIndex: 0,
          required: columnHintsArray?.[0] || 0,
          current: 0,
          reason: "Column clue cannot be satisfied with current state",
        });
      }
    }

    return errors;
  }

  /** Detect if puzzle can be completed from current state */
  canPuzzleBeCompleted(
    grid: number[][],
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
    grid: number[][],
    solution: PuzzleSolutionData,
  ): CompletionError[] {
    const errors: CompletionError[] = [];

    if (!this.canPuzzleBeCompleted(grid, solution)) {
      errors.push({
        type: ErrorType.COMPLETION,
        reason: "Puzzle cannot be completed from current state. Some filled cells are marked incorrectly or empty cells are marked as crossed out.",
      });
    }

    return errors;
  }

  /** Detect all cell errors (invalid markings) */
  detectCellErrors(
    grid: number[][],
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
          });
        } else if (cellState === CellState.CROSSED_OUT && expectedState === CellState.FILLED) {
          errors.push({
            type: ErrorType.CELL,
            row,
            col,
            current: cellState,
            expected: expectedState,
            reason: "Crossed-out cell where solution expects filled",
          });
        }
      }
    }

    return errors;
  }

  /** Detect all errors in a grid */
  detectErrors(
    grid: number[][],
    rowHints: number[][],
    columnHints: number[][],
    solution: PuzzleSolutionData,
  ): PuzzleError[] {
    const errors: PuzzleError[] = [];

    // Detect cell errors
    const cellErrors = this.detectCellErrors(grid, solution);
    errors.push(...cellErrors);

    // Detect clue errors
    const clueErrors = this.detectClueErrors(grid, rowHints, columnHints);
    errors.push(...clueErrors);

    // Detect completion errors
    const completionErrors = this.detectCompletionErrors(grid, solution);
    errors.push(...completionErrors);

    return errors;
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
