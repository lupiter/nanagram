/**
 * PuzzleGenerator - Generates random puzzles with unique solutions
 * 
 * Generates valid nonogram puzzles by randomly filling grids and
 * validating they have unique solutions.
 */

import { PuzzleSolutionData, CellState, SolutionCell } from '../types/nonogram';
import { GeneratedPuzzle } from '../types/puzzle';
import { puzzleService } from './Puzzle';
import { difficultyAnalyzer } from './DifficultyAnalyzer';

// Re-export types for convenience
export type { GeneratedPuzzle };

export class PuzzleGenerator {
  private static instance: PuzzleGenerator;

  /** Get the singleton instance */
  static getInstance(): PuzzleGenerator {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    PuzzleGenerator.instance ??= new PuzzleGenerator();
    return PuzzleGenerator.instance;
  }

  /** Generate a random grid with ~40-60% fill probability */
  private generateRandomGrid(height: number, width: number): PuzzleSolutionData {
    const grid: PuzzleSolutionData = [];
    for (let row = 0; row < height; row++) {
      const rowData: SolutionCell[] = [];
      for (let col = 0; col < width; col++) {
        // Random fill with ~40-60% probability for interesting puzzles
        const fillProbability = 0.4 + Math.random() * 0.2;
        rowData.push(Math.random() < fillProbability ? CellState.FILLED : CellState.EMPTY);
      }
      grid.push(rowData);
    }
    return grid;
  }

  /**
   * Generate a random puzzle of the given size and minimum difficulty.
   * Returns null if unable to generate after max attempts.
   * @param height - Number of rows
   * @param width - Number of columns (defaults to height for square puzzles)
   */
  generate(
    height: number,
    minDifficulty: number,
    maxAttempts = 1000,
    width?: number
  ): GeneratedPuzzle | null {
    const actualWidth = width ?? height;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const grid = this.generateRandomGrid(height, actualWidth);

      // Check if puzzle has unique solution
      if (!puzzleService.checkPuzzleHasUniqueSolution(grid)) {
        continue;
      }

      // Check difficulty
      const difficulty = difficultyAnalyzer.getRating(grid);
      if (difficulty >= minDifficulty) {
        return { solution: grid, difficulty };
      }
    }

    return null;
  }

  /**
   * Generate a random puzzle asynchronously, yielding to the event loop periodically.
   * This prevents the UI from freezing during generation.
   * @param height - Number of rows
   * @param width - Number of columns (defaults to height for square puzzles)
   */
  async generateAsync(
    height: number,
    minDifficulty: number,
    maxAttempts = 1000,
    onProgress?: (attempt: number, found: number) => void,
    width?: number
  ): Promise<GeneratedPuzzle | null> {
    const actualWidth = width ?? height;
    let validFound = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Yield to event loop every 10 attempts
      if (attempt % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        onProgress?.(attempt, validFound);
      }

      const grid = this.generateRandomGrid(height, actualWidth);

      // Check if puzzle has unique solution
      if (!puzzleService.checkPuzzleHasUniqueSolution(grid)) {
        continue;
      }

      validFound++;

      // Check difficulty
      const difficulty = difficultyAnalyzer.getRating(grid);
      if (difficulty >= minDifficulty) {
        return { solution: grid, difficulty };
      }
    }

    return null;
  }
}

/** Convenience export for the singleton instance */
export const puzzleGenerator = PuzzleGenerator.getInstance();
