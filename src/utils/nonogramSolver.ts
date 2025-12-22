/**
 * NonogramSolver - A TypeScript implementation of a nonogram puzzle solver
 * Converted from Python implementation
 */

export class NonogramSolver {
  private noOfRows: number;
  private rowsDone: number[];

  private noOfCols: number;
  private colsDone: number[];

  private solved: boolean;
  public board: number[][];

  private rowsPossibilities: number[][][];
  private colsPossibilities: number[][][];

  constructor(
    private rowsValues: number[][] = [
      [2],
      [4],
      [6],
      [4, 3],
      [5, 4],
      [2, 3, 2],
      [3, 5],
      [5],
      [3],
      [2],
      [2],
      [6],
    ],
    private colsValues: number[][] = [
      [3],
      [5],
      [3, 2, 1],
      [5, 1, 1],
      [12],
      [3, 7],
      [4, 1, 1, 1],
      [3, 1, 1],
      [4],
      [2],
    ]
  ) {
    this.noOfRows = this.rowsValues.length;
    this.rowsDone = new Array(this.noOfRows).fill(0);

    this.noOfCols = this.colsValues.length;
    this.colsDone = new Array(this.noOfCols).fill(0);

    this.solved = false;
    this.board = Array.from({ length: this.noOfRows }, () =>
      new Array(this.noOfCols).fill(0)
    );

    // Step 1: Define all possible solutions for every row and col
    this.rowsPossibilities = this.createPossibilities(
      this.rowsValues,
      this.noOfCols
    );
    this.colsPossibilities = this.createPossibilities(
      this.colsValues,
      this.noOfRows
    );
  }

  /**
   * Solve the nonogram puzzle
   */
  solve(): number[][] {
    let iterationsWithoutProgress = 0;
    while (!this.solved && iterationsWithoutProgress < this.noOfRows * this.noOfCols) {
      // Step 2: Order indices by lowest number of possibilities
      const lowestRows = this.selectIndexNotDone(this.rowsPossibilities, true);
      const lowestCols = this.selectIndexNotDone(this.colsPossibilities, false);
      const lowest = [...lowestRows, ...lowestCols].sort(
        (a, b) => a.count - b.count
      );

      // Step 3: Get only zeroes or only ones of lowest possibility
      for (const { index, isRow } of lowest) {
        if (!this.checkDone(isRow, index)) {
          const values = isRow
            ? this.rowsPossibilities[index]
            : this.colsPossibilities[index];

          const sameInd = this.getOnlyOneOption(values);

          for (const { pos, val } of sameInd) {
            const rowIndex = isRow ? index : pos;
            const colIndex = isRow ? pos : index;

            if (this.board[rowIndex][colIndex] === 0) {
              this.board[rowIndex][colIndex] = val;
              iterationsWithoutProgress = 0;

              if (isRow) {
                this.colsPossibilities[colIndex] = this.removePossibilities(
                  this.colsPossibilities[colIndex],
                  rowIndex,
                  val
                );
              } else {
                this.rowsPossibilities[rowIndex] = this.removePossibilities(
                  this.rowsPossibilities[rowIndex],
                  colIndex,
                  val
                );
              }
            }
          }
          this.updateDone(isRow, index);
        }
      }
      this.checkSolved();
      if (!this.solved) {
        iterationsWithoutProgress++;
      }
    }

    return this.board;
  }

  /**
   * Generate all combinations of k elements from range 0 to n-1
   */
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

  /**
   * Create all possible arrangements for a single row/column hint
   */
  private createPossibilitiesForHint(
    nEmpty: number,
    groups: number,
    ones: number[][]
  ): number[][] {
    const resOpts: number[][] = [];

    for (const p of this.combinations(groups + nEmpty, groups)) {
      const selected: number[] = new Array(groups + nEmpty).fill(-1);
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
      // Remove the last -1
      resOpt.pop();
      resOpts.push(resOpt);
    }

    return resOpts;
  }

  /**
   * Create all possible arrangements for all rows or columns
   */
  private createPossibilities(
    values: number[][],
    noOfOther: number
  ): number[][][] {
    const possibilities: number[][][] = [];

    for (const v of values) {
      const groups = v.length;
      const nEmpty = noOfOther - v.reduce((a, b) => a + b, 0) - groups + 1;
      const ones = v.map((x) => new Array(x).fill(1));
      const res = this.createPossibilitiesForHint(nEmpty, groups, ones);
      possibilities.push(res);
    }

    return possibilities;
  }

  /**
   * Select indices that are not yet done, with their possibility count
   */
  private selectIndexNotDone(
    possibilities: number[][][],
    isRow: boolean
  ): { index: number; count: number; isRow: boolean }[] {
    const doneArray = isRow ? this.rowsDone : this.colsDone;
    return possibilities
      .map((p, i) => ({ index: i, count: p.length, isRow }))
      .filter((_, i) => doneArray[i] === 0);
  }

  /**
   * Get positions where all possibilities agree on the same value
   */
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

  /**
   * Remove possibilities that don't match the given value at position i
   */
  private removePossibilities(
    possibilities: number[][],
    i: number,
    val: number
  ): number[][] {
    return possibilities.filter((p) => p[i] === val);
  }

  /**
   * Update the done status for a row or column
   */
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

  /**
   * Check if a row or column is done
   */
  private checkDone(isRow: boolean, idx: number): boolean {
    return isRow ? this.rowsDone[idx] === 1 : this.colsDone[idx] === 1;
  }

  /**
   * Check if the entire puzzle is solved
   */
  private checkSolved(): void {
    if (!this.rowsDone.includes(0) && !this.colsDone.includes(0)) {
      this.solved = true;
    }
  }

  /**
   * Get the solved board as a boolean grid (true = filled, false = empty)
   */
  getBooleanBoard(): boolean[][] {
    return this.board.map((row) => row.map((cell) => cell === 1));
  }

  /**
   * Display the board in console (for debugging)
   */
  displayBoard(): void {
    console.log("\nNonogram Board:");
    for (const row of this.board) {
      console.log(
        row.map((cell) => (cell === 1 ? "█" : cell === -1 ? "·" : "?")).join("")
      );
    }
    console.log();
  }

  /**
   * Check if the puzzle is solved
   */
  isSolved(): boolean {
    return this.solved;
  }
}

/**
 * Convenience function to solve a nonogram puzzle
 */
export function solveNonogram(
  rowHints: number[][],
  colHints: number[][]
): number[][] {
  const solver = new NonogramSolver(rowHints, colHints);
  return solver.solve();
}

/**
 * Convenience function to solve and get boolean result
 */
export function solveNonogramToBoolean(
  rowHints: number[][],
  colHints: number[][]
): boolean[][] {
  const solver = new NonogramSolver(rowHints, colHints);
  solver.solve();
  return solver.getBooleanBoard();
}
