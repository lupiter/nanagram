import { PuzzleSolutionData } from '../types/nonogram';
import puzzles5x5 from '../puzzles/5x5';
import puzzles10x10 from '../puzzles/10x10';
import puzzles15x15 from '../puzzles/15x15';
import puzzles20x20 from '../puzzles/20x20';

export const puzzleMap = {
  '5x5': puzzles5x5,
  '10x10': puzzles10x10,
  '15x15': puzzles15x15,
  '20x20': puzzles20x20,
};

export type PuzzleCategory = keyof typeof puzzleMap;

export function puzzle(category: string, id: string): PuzzleSolutionData {
  const puzzles = puzzleMap[category as PuzzleCategory];
  return puzzles[parseInt(id) - 1];
}

export function puzzlesByCategory(category: string): PuzzleSolutionData[] {
  return puzzleMap[category as PuzzleCategory];
}

export function getPuzzleCount(category: string): number {
  return puzzleMap[category as PuzzleCategory]?.length ?? 0;
}

export function getNextPuzzle(category: string, currentId: string): { category: string; id: string } | null {
  const currentIndex = parseInt(currentId);
  const puzzleCount = getPuzzleCount(category);
  
  // Check if there's a next puzzle in the same category
  if (currentIndex < puzzleCount) {
    return { category, id: String(currentIndex + 1) };
  }
  
  // Move to next category
  const categories = Object.keys(puzzleMap) as PuzzleCategory[];
  const categoryIndex = categories.indexOf(category as PuzzleCategory);
  
  if (categoryIndex < categories.length - 1) {
    const nextCategory = categories[categoryIndex + 1];
    return { category: nextCategory, id: '1' };
  }
  
  return null;
}

export function getPreviousPuzzle(category: string, currentId: string): { category: string; id: string } | null {
  const currentIndex = parseInt(currentId);
  
  // Check if there's a previous puzzle in the same category
  if (currentIndex > 1) {
    return { category, id: String(currentIndex - 1) };
  }
  
  // Move to previous category
  const categories = Object.keys(puzzleMap) as PuzzleCategory[];
  const categoryIndex = categories.indexOf(category as PuzzleCategory);
  
  if (categoryIndex > 0) {
    const prevCategory = categories[categoryIndex - 1];
    const prevCategoryCount = getPuzzleCount(prevCategory);
    return { category: prevCategory, id: String(prevCategoryCount) };
  }
  
  return null;
}

// Completed puzzles tracking
const COMPLETED_KEY = 'nonogram-completed';

export function getCompletedPuzzles(): Set<string> {
  const stored = localStorage.getItem(COMPLETED_KEY);
  if (!stored) return new Set();
  try {
    return new Set(JSON.parse(stored) as string[]);
  } catch {
    return new Set();
  }
}

export function markPuzzleCompleted(category: string, id: string): void {
  const completed = getCompletedPuzzles();
  completed.add(`${category}-${id}`);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]));
}

export function isPuzzleCompleted(category: string, id: string): boolean {
  return getCompletedPuzzles().has(`${category}-${id}`);
}

// Progress persistence
function getProgressKey(category: string, id: string): string {
  return `nonogram-progress-${category}-${id}`;
}

export function saveProgress(category: string, id: string, grid: number[][]): void {
  localStorage.setItem(getProgressKey(category, id), JSON.stringify(grid));
}

export function loadProgress(category: string, id: string): number[][] | null {
  const stored = localStorage.getItem(getProgressKey(category, id));
  if (!stored) return null;
  try {
    return JSON.parse(stored) as number[][];
  } catch {
    return null;
  }
}

export function clearProgress(category: string, id: string): void {
  localStorage.removeItem(getProgressKey(category, id));
}
