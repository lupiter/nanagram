import { CellState, Hint, PuzzleSolutionData, SolutionCell } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";

export interface DesignerState {
  size: number;
  grid: PuzzleSolutionData;
  rowHints: Hint[][];
  columnHints: Hint[][];
  puzzleName: string;
  isChecking: boolean;
  hasUniqueSolution: boolean | null;
  difficulty: number | null; // Calculated difficulty when puzzle is valid
  isDragging: boolean;
  dragMode: SolutionCell | null; // What we're filling with during drag
  draggedCells: Map<number, Set<number>>;
}

export function createEmptyGrid(size: number): PuzzleSolutionData {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => CellState.EMPTY)
  );
}

export function createInitialState(size = 5): DesignerState {
  const grid = createEmptyGrid(size);
  return {
    size,
    grid,
    rowHints: deriveRowHints(grid),
    columnHints: deriveColumnHints(grid),
    puzzleName: "",
    isChecking: false,
    hasUniqueSolution: null,
    difficulty: null,
    isDragging: false,
    dragMode: null,
    draggedCells: new Map(),
  };
}

