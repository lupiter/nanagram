/**
 * Types for user-created puzzle designs
 */

import { PuzzleSolutionData, Hint, SolutionCell } from "./nonogram";

/** A saved user design */
export interface SavedDesign {
  id: string;
  name: string;
  height: number;
  width: number;
  difficulty: number;
  solution: PuzzleSolutionData;
  createdAt: string; // ISO date string
}

/** Result of importing designs */
export interface ImportResult {
  imported: number;
  skipped: number;
}

/** State for the puzzle designer */
export interface DesignerState {
  height: number;
  width: number;
  grid: PuzzleSolutionData;
  rowHints: Hint[][];
  columnHints: Hint[][];
  puzzleName: string;
  isChecking: boolean;
  hasUniqueSolution: boolean | null;
  difficulty: number | null;
  isDragging: boolean;
  dragMode: SolutionCell | null;
  draggedCells: Map<number, Set<number>>;
}
