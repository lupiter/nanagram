/**
 * Puzzle - Core puzzle utility functions and solver
 */

import {
  GameState,
  Hint,
  PuzzleSolutionData,
  CellState,
  Cell,
} from "../types/nonogram";

/**
 * NonogramSolverCore - Internal solver implementation
 */
class NonogramSolverCore {
  private noOfRows: number;
  private rowsDone: number[];
  private noOfCols: number;
  private colsDone: number[];
  private solved: boolean;
  public board: number[][];
  private rowsPossibilities: number[][][];
  private colsPossibilities: number[][][];

  constructor(
    private rowsValues: number[][],
    private colsValues: number[][]
  ) {
    this.noOfRows = this.rowsValues.length;
    this.rowsDone = Array.from({ length: this.noOfRows }, () => 0);
    this.noOfCols = this.colsValues.length;
    this.colsDone = Array.from({ length: this.noOfCols }, () => 0);
    this.solved = false;
    this.board = Array.from({ length: this.noOfRows }, () =>
      Array.from({ length: this.noOfCols }, () => 0)
    );

    this.rowsPossibilities = this.createPossibilities(this.rowsValues, this.noOfCols);
    this.colsPossibilities = this.createPossibilities(this.colsValues, this.noOfRows);
  }

  solve(): number[][] {
    let iterationsWithoutProgress = 0;
    while (!this.solved && iterationsWithoutProgress < this.noOfRows * this.noOfCols) {
      const lowestRows = this.selectIndexNotDone(this.rowsPossibilities, true);
      const lowestCols = this.selectIndexNotDone(this.colsPossibilities, false);
      const lowest = [...lowestRows, ...lowestCols].sort((a, b) => a.count - b.count);

      for (const { index, isRow } of lowest) {
        if (!this.checkDone(isRow, index)) {
          const values = isRow ? this.rowsPossibilities[index] : this.colsPossibilities[index];
          const sameInd = this.getOnlyOneOption(values);

          for (const { pos, val } of sameInd) {
            const rowIndex = isRow ? index : pos;
            const colIndex = isRow ? pos : index;

            if (this.board[rowIndex][colIndex] === 0) {
              this.board[rowIndex][colIndex] = val;
              iterationsWithoutProgress = 0;

              if (isRow) {
                this.colsPossibilities[colIndex] = this.removePossibilities(
                  this.colsPossibilities[colIndex], rowIndex, val
                );
              } else {
                this.rowsPossibilities[rowIndex] = this.removePossibilities(
                  this.rowsPossibilities[rowIndex], colIndex, val
                );
              }
            }
          }
          this.updateDone(isRow, index);
        }
      }
      this.checkSolved();
      iterationsWithoutProgress++;
    }
    return this.board;
  }

  private combinations(n: number, k: number): number[][] {
    const result: number[][] = [];
    const combine = (start: number, combo: number[]): void => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < n; i++) {
        combo.push(i);
        combine(i + 1, combo);
        combo.pop();
      }
    };
    combine(0, []);
    return result;
  }

  private createPossibilitiesForHint(nEmpty: number, groups: number, ones: number[][]): number[][] {
    const resOpts: number[][] = [];
    for (const p of this.combinations(groups + nEmpty, groups)) {
      const selected: number[] = Array.from({ length: groups + nEmpty }, () => -1);
      let onesIdx = 0;
      for (const val of p) {
        selected[val] = onesIdx;
        onesIdx++;
      }
      const resOpt: number[] = [];
      for (const val of selected) {
        if (val > -1) {
          resOpt.push(...ones[val], -1);
        } else {
          resOpt.push(-1);
        }
      }
      resOpt.pop();
      resOpts.push(resOpt);
    }
    return resOpts;
  }

  private createPossibilities(values: number[][], noOfOther: number): number[][][] {
    const possibilities: number[][][] = [];
    for (const v of values) {
      const groups = v.length;
      const nEmpty = noOfOther - v.reduce((a, b) => a + b, 0) - groups + 1;
      const ones = v.map((x) => Array.from({ length: x }, () => 1));
      const res = this.createPossibilitiesForHint(nEmpty, groups, ones);
      possibilities.push(res);
    }
    return possibilities;
  }

  private selectIndexNotDone(possibilities: number[][][], isRow: boolean): { index: number; count: number; isRow: boolean }[] {
    const doneArray = isRow ? this.rowsDone : this.colsDone;
    return possibilities
      .map((p, i) => ({ index: i, count: p.length, isRow }))
      .filter((_, i) => doneArray[i] === 0);
  }

  private getOnlyOneOption(values: number[][]): { pos: number; val: number }[] {
    if (values.length === 0) return [];
    const length = values[0].length;
    const result: { pos: number; val: number }[] = [];
    for (let n = 0; n < length; n++) {
      const columnValues = values.map((v) => v[n]);
      const uniqueValues = [...new Set(columnValues)];
      if (uniqueValues.length === 1) {
        result.push({ pos: n, val: uniqueValues[0] });
      }
    }
    return result;
  }

  private removePossibilities(possibilities: number[][], i: number, val: number): number[][] {
    return possibilities.filter((p) => p[i] === val);
  }

  private updateDone(isRow: boolean, idx: number): void {
    const vals = isRow ? this.board[idx] : this.board.map((row) => row[idx]);
    if (!vals.includes(0)) {
      if (isRow) {
        this.rowsDone[idx] = 1;
      } else {
        this.colsDone[idx] = 1;
      }
    }
  }

  private checkDone(isRow: boolean, idx: number): boolean {
    return isRow ? this.rowsDone[idx] === 1 : this.colsDone[idx] === 1;
  }

  private checkSolved(): void {
    if (!this.rowsDone.includes(0) && !this.colsDone.includes(0)) {
      this.solved = true;
    }
  }

  getBooleanBoard(): boolean[][] {
    return this.board.map((row) => row.map((cell) => cell === 1));
  }

  isSolved(): boolean {
    return this.solved;
  }
}

/**
 * Puzzle - Singleton service for puzzle utilities and solving
 */
export class Puzzle {
  private static instance: Puzzle;

  static getInstance(): Puzzle {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Puzzle.instance ??= new Puzzle();
    return Puzzle.instance;
  }

  // --- Grid Creation ---

  /** Creates an empty game state for a puzzle of given dimensions */
  createEmptyGameState(width: number, height: number): GameState {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () => CellState.EMPTY)
    );
  }

  // --- Hint Derivation ---

  /** Derives hints for all rows in a puzzle */
  deriveRowHints(solution: PuzzleSolutionData): Hint[][] {
    return solution.map((row) => {
      const hints: Hint[] = [];
      let currentCount = 0;

      for (const cell of row) {
        if (cell === CellState.FILLED) {
          currentCount++;
        } else if (currentCount > 0) {
          hints.push({ hint: currentCount, used: false });
          currentCount = 0;
        }
      }

      if (currentCount > 0) {
        hints.push({ hint: currentCount, used: false });
      }

      return hints;
    });
  }

  /** Derives hints for all columns in a puzzle */
  deriveColumnHints(solution: PuzzleSolutionData): Hint[][] {
    const width = solution[0]?.length ?? 0;
    const height = solution.length;
    const hints: Hint[][] = [];

    for (let col = 0; col < width; col++) {
      const columnHints: Hint[] = [];
      let currentCount = 0;

      for (let row = 0; row < height; row++) {
        if (solution[row][col] === CellState.FILLED) {
          currentCount++;
        } else if (currentCount > 0) {
          columnHints.push({ hint: currentCount, used: false });
          currentCount = 0;
        }
      }

      if (currentCount > 0) {
        columnHints.push({ hint: currentCount, used: false });
      }

      hints.push(columnHints);
    }

    return hints;
  }

  // --- Validation ---

  /** Validates that a puzzle has valid dimensions and cell values */
  validatePuzzle(solution: PuzzleSolutionData): boolean {
    if (solution.length === 0) return false;
    const width = solution[0]?.length ?? 0;
    if (width === 0) return false;

    for (const row of solution) {
      if (row.length !== width) return false;
    }
    return true;
  }

  /** Checks if the current game state matches the solution */
  checkSolution(solution: PuzzleSolutionData, gameState: GameState): boolean {
    const height = solution.length;
    const width = solution[0]?.length ?? 0;

    if (gameState.length !== height || gameState.some((row) => row.length !== width)) {
      return false;
    }

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const gameCell = gameState[i][j];
        const solutionCell = solution[i][j];

        if (
          (gameCell === CellState.CROSSED_OUT && solutionCell === CellState.FILLED) ||
          (gameCell === CellState.FILLED && solutionCell === CellState.EMPTY) ||
          (gameCell === CellState.EMPTY && solutionCell === CellState.FILLED)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /** Check if a row or column is complete */
  isRowOrColumnComplete(
    solution: PuzzleSolutionData,
    gameState: GameState,
    isRow: boolean,
    index: number
  ): boolean {
    const line = isRow ? gameState[index] : gameState.map(row => row[index]);
    const solutionLine = isRow ? solution[index] : solution.map(row => row[index]);

    for (let i = 0; i < line.length; i++) {
      if (line[i] === CellState.EMPTY && solutionLine[i] === CellState.FILLED) {
        return false;
      }
    }

    return true;
  }

  // --- Possibility Generation ---

  /** Generate all possible data arrangements for a set of hints */
  generatePossibleDataForHints(hints: Hint[], size: number): Cell[][] {
    if (hints.length === 0) {
      return [Array.from({ length: size }, () => CellState.EMPTY as Cell)];
    }

    const solutions: Cell[][] = [];
    
    const placeHints = (hintIndex: number, startPos: number, currentSolution: Cell[]): void => {
      if (hintIndex >= hints.length) {
        const solution = [...currentSolution];
        while (solution.length < size) {
          solution.push(CellState.EMPTY);
        }
        solutions.push(solution);
        return;
      }

      const hint = hints[hintIndex];
      const remainingHints = hints.slice(hintIndex + 1);
      const minSpaceNeeded = remainingHints.reduce((acc, h) => acc + h.hint + 1, 0);
      const maxStartPos = size - hint.hint - minSpaceNeeded;

      for (let pos = startPos; pos <= maxStartPos; pos++) {
        const solution = [...currentSolution];
        while (solution.length < pos) {
          solution.push(CellState.EMPTY);
        }
        for (let i = 0; i < hint.hint; i++) {
          solution.push(CellState.FILLED);
        }
        placeHints(hintIndex + 1, solution.length + 1, solution);
      }
    };

    placeHints(0, 0, []);
    return solutions;
  }

  // --- Solver ---

  /** Solve a nonogram puzzle from hints and return the board */
  solve(rowHints: number[][], colHints: number[][]): number[][] {
    const solver = new NonogramSolverCore(rowHints, colHints);
    return solver.solve();
  }

  /** Solve a nonogram puzzle and return boolean result */
  solveToBoolean(rowHints: number[][], colHints: number[][]): boolean[][] {
    const solver = new NonogramSolverCore(rowHints, colHints);
    solver.solve();
    return solver.getBooleanBoard();
  }

  /** Check if a puzzle has a unique solution */
  checkPuzzleHasUniqueSolution(solution: PuzzleSolutionData): boolean {
    const rowHints = this.deriveRowHints(solution).map((row) => row.map((hint) => hint.hint));
    const columnHints = this.deriveColumnHints(solution).map((column) => column.map((hint) => hint.hint));

    const solvedBoard = this.solve(rowHints, columnHints);
    return this.checkSolution(solution, solvedBoard);
  }
}

/** Convenience export for the singleton instance */
export const puzzleService = Puzzle.getInstance();
