import { CellState, Hint, PuzzleSolutionData } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";

export interface DesignerState {
  size: number;
  grid: PuzzleSolutionData;
  rowHints: Hint[][];
  columnHints: Hint[][];
  puzzleName: string;
  isChecking: boolean;
  hasUniqueSolution: boolean | null;
}

export function createEmptyGrid(size: number): PuzzleSolutionData {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => CellState.EMPTY)
  );
}

export function createInitialState(size: number = 5): DesignerState {
  const grid = createEmptyGrid(size);
  return {
    size,
    grid,
    rowHints: deriveRowHints(grid),
    columnHints: deriveColumnHints(grid),
    puzzleName: "",
    isChecking: false,
    hasUniqueSolution: null,
  };
}

