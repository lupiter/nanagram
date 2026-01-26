/**
 * DifficultyAnalyzer - Estimates puzzle difficulty based on solver behavior
 * 
 * Metrics used:
 * 1. First pass progress - How many cells solved in the first iteration
 * 2. Total iterations - How many passes the solver needs
 * 3. Initial forced cells - Cells immediately determinable from single-line analysis
 * 4. Possibility reduction rate - How quickly possibilities narrow down
 */

import { PuzzleSolutionData } from '../types/nonogram';
import { DifficultyMetrics } from '../types/puzzle';
import { puzzleService } from './Puzzle';

/**
 * Internal analyzer that tracks difficulty metrics during solving
 */
class DifficultyAnalyzerCore {
  private noOfRows: number;
  private noOfCols: number;
  private rowsDone: number[];
  private colsDone: number[];
  private solved: boolean;
  private board: number[][];
  private rowsPossibilities: number[][][];
  private colsPossibilities: number[][][];
  
  // Metrics
  private cellsSolvedPerIteration: number[] = [];
  private initialPossibilityCounts: number[] = [];

  constructor(
    private rowsValues: number[][],
    private colsValues: number[][]
  ) {
    this.noOfRows = this.rowsValues.length;
    this.noOfCols = this.colsValues.length;
    this.rowsDone = Array.from({ length: this.noOfRows }, () => 0);
    this.colsDone = Array.from({ length: this.noOfCols }, () => 0);
    this.solved = false;
    this.board = Array.from({ length: this.noOfRows }, () =>
      Array.from({ length: this.noOfCols }, () => 0)
    );

    this.rowsPossibilities = this.createPossibilities(this.rowsValues, this.noOfCols);
    this.colsPossibilities = this.createPossibilities(this.colsValues, this.noOfRows);
    
    // Track initial possibilities
    for (const rp of this.rowsPossibilities) {
      this.initialPossibilityCounts.push(rp.length);
    }
    for (const cp of this.colsPossibilities) {
      this.initialPossibilityCounts.push(cp.length);
    }
  }

  /**
   * Count cells that are forced by analyzing each line independently
   * (without cross-referencing between rows and columns)
   */
  countInitialForcedCells(): number {
    let forced = 0;
    
    // Check each row independently
    for (const possibilities of this.rowsPossibilities) {
      if (possibilities.length === 0) continue;
      const length = possibilities[0].length;
      for (let col = 0; col < length; col++) {
        const values = possibilities.map(p => p[col]);
        if (new Set(values).size === 1) {
          forced++;
        }
      }
    }
    
    // Check each column independently
    for (const possibilities of this.colsPossibilities) {
      if (possibilities.length === 0) continue;
      const length = possibilities[0].length;
      for (let row = 0; row < length; row++) {
        const values = possibilities.map(p => p[row]);
        if (new Set(values).size === 1) {
          forced++;
        }
      }
    }
    
    // Divide by 2 because each cell is counted in both row and column
    return Math.floor(forced / 2);
  }

  solve(): void {
    let iterationsWithoutProgress = 0;
    
    while (!this.solved && iterationsWithoutProgress < this.noOfRows * this.noOfCols) {
      const cellsBefore = this.countSolvedCells();
      
      const lowestRows = this.selectIndexNotDone(this.rowsPossibilities, true);
      const lowestCols = this.selectIndexNotDone(this.colsPossibilities, false);
      const lowest = [...lowestRows, ...lowestCols].sort((a, b) => a.count - b.count);

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
      
      const cellsAfter = this.countSolvedCells();
      this.cellsSolvedPerIteration.push(cellsAfter - cellsBefore);
      
      this.checkSolved();
      iterationsWithoutProgress++;
    }
  }

  private countSolvedCells(): number {
    let count = 0;
    for (const row of this.board) {
      for (const cell of row) {
        if (cell !== 0) count++;
      }
    }
    return count;
  }

  getMetrics(): DifficultyMetrics {
    const totalCells = this.noOfRows * this.noOfCols;
    const firstPassCells = this.cellsSolvedPerIteration[0] || 0;
    const iterations = this.cellsSolvedPerIteration.length;
    const initialForcedCells = this.countInitialForcedCells();
    const avgPossibilities = this.initialPossibilityCounts.reduce((a, b) => a + b, 0) / 
                             this.initialPossibilityCounts.length;
    
    // Calculate difficulty based on multiple factors
    const difficulty = this.calculateDifficulty(
      firstPassCells,
      totalCells,
      iterations,
      initialForcedCells,
      avgPossibilities
    );
    
    return {
      difficulty,
      firstPassCells,
      totalCells,
      firstPassPercent: (firstPassCells / totalCells) * 100,
      iterations,
      initialForcedCells,
      avgPossibilities,
    };
  }

  private calculateDifficulty(
    firstPassCells: number,
    totalCells: number,
    iterations: number,
    initialForcedCells: number,
    avgPossibilities: number
  ): number {
    // Factor 1: First pass progress (higher = easier)
    const firstPassRatio = firstPassCells / totalCells;
    const firstPassScore = 1 - firstPassRatio; // 0 = easy, 1 = hard
    
    // Factor 2: Iterations needed (more = harder)
    const size = Math.sqrt(totalCells);
    const expectedIterations = size * 0.5;
    const iterationScore = Math.min(1, (iterations - 1) / (expectedIterations * 2));
    
    // Factor 3: Initial forced cells (more = easier)
    const forcedRatio = initialForcedCells / totalCells;
    const forcedScore = 1 - forcedRatio; // 0 = easy, 1 = hard
    
    // Factor 4: Average possibilities (more = harder)
    const possibilityScore = Math.min(1, Math.log10(avgPossibilities + 1) / 3);
    
    // Weighted combination
    const weights = {
      firstPass: 0.35,
      iterations: 0.25,
      forced: 0.25,
      possibilities: 0.15
    };
    
    const rawScore = 
      firstPassScore * weights.firstPass +
      iterationScore * weights.iterations +
      forcedScore * weights.forced +
      possibilityScore * weights.possibilities;
    
    // Map to 1-5 scale
    if (rawScore < 0.15) return 1;
    if (rawScore < 0.30) return 2;
    if (rawScore < 0.50) return 3;
    if (rawScore < 0.70) return 4;
    return 5;
  }

  // --- Helper methods ---
  
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
      if (v.length === 0 || (v.length === 1 && v[0] === 0)) {
        possibilities.push([Array.from({ length: noOfOther }, (): number => -1)]);
        continue;
      }
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
}

/**
 * DifficultyAnalyzer - Singleton for analyzing puzzle difficulty
 */
export class DifficultyAnalyzer {
  private static instance: DifficultyAnalyzer;

  static getInstance(): DifficultyAnalyzer {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    DifficultyAnalyzer.instance ??= new DifficultyAnalyzer();
    return DifficultyAnalyzer.instance;
  }

  /** Analyze the difficulty of a puzzle solution and get full metrics */
  analyze(solution: PuzzleSolutionData): DifficultyMetrics {
    const rowHints = puzzleService.deriveRowHints(solution).map(row => row.map(h => h.hint));
    const colHints = puzzleService.deriveColumnHints(solution).map(col => col.map(h => h.hint));
    
    // Handle empty hints (all-empty rows/columns)
    const processedRowHints = rowHints.map(hints => hints.length === 0 ? [0] : hints);
    const processedColHints = colHints.map(hints => hints.length === 0 ? [0] : hints);
    
    const analyzer = new DifficultyAnalyzerCore(processedRowHints, processedColHints);
    analyzer.solve();
    
    return analyzer.getMetrics();
  }

  /** Get just the difficulty rating (1-5) */
  getRating(solution: PuzzleSolutionData): number {
    return this.analyze(solution).difficulty;
  }
}

/** Convenience export for the singleton instance */
export const difficultyAnalyzer = DifficultyAnalyzer.getInstance();
