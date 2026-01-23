import { PuzzleSolutionData, CellState, SolutionCell } from '../types/nonogram';
import { checkPuzzleHasUniqueSolution } from './puzzleUtils';
import { getDifficultyRating } from './difficultyAnalyzer';

export interface GeneratedPuzzle {
  solution: PuzzleSolutionData;
  difficulty: number;
}

function generateRandomGrid(size: number): PuzzleSolutionData {
  const grid: PuzzleSolutionData = [];
  for (let row = 0; row < size; row++) {
    const rowData: SolutionCell[] = [];
    for (let col = 0; col < size; col++) {
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
 */
export function generateRandomPuzzle(
  size: number,
  minDifficulty: number,
  maxAttempts = 1000
): GeneratedPuzzle | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid = generateRandomGrid(size);
    
    // Check if puzzle has unique solution
    if (!checkPuzzleHasUniqueSolution(grid)) {
      continue;
    }
    
    // Check difficulty
    const difficulty = getDifficultyRating(grid);
    if (difficulty >= minDifficulty) {
      return { solution: grid, difficulty };
    }
  }
  
  return null;
}

/**
 * Generate a random puzzle asynchronously, yielding to the event loop periodically.
 * This prevents the UI from freezing during generation.
 */
export async function generateRandomPuzzleAsync(
  size: number,
  minDifficulty: number,
  maxAttempts = 1000,
  onProgress?: (attempt: number, found: number) => void
): Promise<GeneratedPuzzle | null> {
  let validFound = 0;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Yield to event loop every 10 attempts
    if (attempt % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
      onProgress?.(attempt, validFound);
    }
    
    const grid = generateRandomGrid(size);
    
    // Check if puzzle has unique solution
    if (!checkPuzzleHasUniqueSolution(grid)) {
      continue;
    }
    
    validFound++;
    
    // Check difficulty
    const difficulty = getDifficultyRating(grid);
    if (difficulty >= minDifficulty) {
      return { solution: grid, difficulty };
    }
  }
  
  return null;
}
