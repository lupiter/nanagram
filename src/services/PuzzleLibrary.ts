/**
 * PuzzleLibrary - Manages puzzle definitions, completion tracking, and progress
 * 
 * Handles loading built-in puzzles and persisting user progress to localStorage.
 */

import { PuzzleDefinition } from '../types/nonogram';
import { PuzzleLocation } from '../types/puzzle';
import puzzles5x5 from '../puzzles/5x5';
import puzzles10x10 from '../puzzles/10x10';
import puzzles10x15 from '../puzzles/10x15';
import puzzles15x15 from '../puzzles/15x15';
import puzzles20x20 from '../puzzles/20x20';

// Re-export types for convenience
export type { PuzzleLocation };

export class PuzzleLibrary {
  private static instance: PuzzleLibrary;

  private readonly completedKey = 'nonogram-completed';
  private readonly progressKeyPrefix = 'nonogram-progress-';

  /** Map of category to puzzle definitions */
  readonly puzzleMap = {
    '5x5': puzzles5x5,
    '10x10': puzzles10x10,
    '10x15': puzzles10x15,
    '15x15': puzzles15x15,
    '20x20': puzzles20x20,
  } as const;

  /** Get the singleton instance */
  static getInstance(): PuzzleLibrary {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    PuzzleLibrary.instance ??= new PuzzleLibrary();
    return PuzzleLibrary.instance;
  }

  /** Get all category names */
  getCategories(): string[] {
    return Object.keys(this.puzzleMap);
  }

  /** Get puzzle by category and id (1-indexed) */
  getPuzzle(category: string, id: string): PuzzleDefinition {
    const puzzles = this.puzzleMap[category as keyof typeof this.puzzleMap];
    return puzzles[parseInt(id) - 1];
  }

  /** Get all puzzles in a category */
  getPuzzlesByCategory(category: string): PuzzleDefinition[] {
    return this.puzzleMap[category as keyof typeof this.puzzleMap];
  }

  /** Get count of puzzles in a category */
  getPuzzleCount(category: string): number {
    return this.puzzleMap[category as keyof typeof this.puzzleMap].length;
  }

  /** Get next puzzle location, or null if at the end */
  getNextPuzzle(category: string, currentId: string): PuzzleLocation | null {
    const currentIndex = parseInt(currentId);
    const puzzleCount = this.getPuzzleCount(category);

    // Check if there's a next puzzle in the same category
    if (currentIndex < puzzleCount) {
      return { category, id: String(currentIndex + 1) };
    }

    // Move to next category
    const categories = this.getCategories();
    const categoryIndex = categories.indexOf(category);

    if (categoryIndex < categories.length - 1) {
      const nextCategory = categories[categoryIndex + 1];
      return { category: nextCategory, id: '1' };
    }

    return null;
  }

  /** Get previous puzzle location, or null if at the beginning */
  getPreviousPuzzle(category: string, currentId: string): PuzzleLocation | null {
    const currentIndex = parseInt(currentId);

    // Check if there's a previous puzzle in the same category
    if (currentIndex > 1) {
      return { category, id: String(currentIndex - 1) };
    }

    // Move to previous category
    const categories = this.getCategories();
    const categoryIndex = categories.indexOf(category);

    if (categoryIndex > 0) {
      const prevCategory = categories[categoryIndex - 1];
      const prevCategoryCount = this.getPuzzleCount(prevCategory);
      return { category: prevCategory, id: String(prevCategoryCount) };
    }

    return null;
  }

  // --- Completion Tracking ---

  /** Get set of completed puzzle keys (format: "category-id") */
  getCompletedPuzzles(): Set<string> {
    const stored = localStorage.getItem(this.completedKey);
    if (!stored) return new Set();
    try {
      return new Set(JSON.parse(stored) as string[]);
    } catch {
      return new Set();
    }
  }

  /** Mark a puzzle as completed */
  markCompleted(category: string, id: string): void {
    const completed = this.getCompletedPuzzles();
    completed.add(`${category}-${id}`);
    localStorage.setItem(this.completedKey, JSON.stringify([...completed]));
  }

  /** Check if a puzzle is completed */
  isCompleted(category: string, id: string): boolean {
    return this.getCompletedPuzzles().has(`${category}-${id}`);
  }

  // --- Progress Persistence ---

  /** Get the localStorage key for a puzzle's progress */
  private getProgressKey(category: string, id: string): string {
    return `${this.progressKeyPrefix}${category}-${id}`;
  }

  /** Save puzzle progress */
  saveProgress(category: string, id: string, grid: number[][]): void {
    localStorage.setItem(this.getProgressKey(category, id), JSON.stringify(grid));
  }

  /** Load puzzle progress, or null if none saved */
  loadProgress(category: string, id: string): number[][] | null {
    const stored = localStorage.getItem(this.getProgressKey(category, id));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as number[][];
    } catch {
      return null;
    }
  }

  /** Clear puzzle progress */
  clearProgress(category: string, id: string): void {
    localStorage.removeItem(this.getProgressKey(category, id));
  }
}

/** Convenience export for the singleton instance */
export const puzzleLibrary = PuzzleLibrary.getInstance();
