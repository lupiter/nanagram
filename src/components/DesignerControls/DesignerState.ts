import { CellState, PuzzleSolutionData, SolutionCell } from "../../types/nonogram";
import { DesignerState } from "../../types/design";
import { puzzleService } from "../../services/Puzzle";

// Re-export for convenience
export type { DesignerState };

/** Creates an empty solution grid (all cells empty) */
export function createEmptySolutionGrid(height: number, width: number): PuzzleSolutionData {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => CellState.EMPTY as SolutionCell)
  );
}

export function createInitialDesignerState(height: number, width: number): DesignerState {
  const grid = createEmptySolutionGrid(height, width);
  return {
    height,
    width,
    grid,
    rowHints: puzzleService.deriveRowHints(grid),
    columnHints: puzzleService.deriveColumnHints(grid),
    puzzleName: "",
    isChecking: false,
    hasUniqueSolution: null,
    difficulty: null,
    isDragging: false,
    dragMode: null,
    draggedCells: new Map(),
  };
}

