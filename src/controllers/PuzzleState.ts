import { WorkingGrid, GameMode } from "../types/puzzle";
import { CellState, Hint, PuzzleSolutionData } from "../types/nonogram";
import { createEmptyGameState, deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";

export interface HistoryEntry {
  grid: WorkingGrid;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

export interface PuzzleState {
  // Core game state
  grid: WorkingGrid;
  rowHints: Hint[][];
  columnHints: Hint[][];
  tool: CellState;
  mode: GameMode;

  // Puzzle status
  isSolved: boolean;
  showVictory: boolean;
  errorCell: [number, number] | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  isUndoRedoAction: boolean;

  // Drag state
  isDragging: boolean;
  dragTool: CellState | null;
  draggedCells: Map<number, Set<number>>;
}

export function createInitialState(
  solution: PuzzleSolutionData,
  savedGrid?: WorkingGrid | null,
  savedMode?: GameMode | null
): PuzzleState {
  const grid = savedGrid ?? createEmptyGameState(solution[0].length, solution.length);

  return {
    grid,
    rowHints: deriveRowHints(solution),
    columnHints: deriveColumnHints(solution),
    tool: CellState.FILLED,
    mode: savedMode ?? GameMode.Assisted,
    isSolved: false,
    showVictory: false,
    errorCell: null,
    history: [],
    historyIndex: -1,
    isUndoRedoAction: false,
    isDragging: false,
    dragTool: null,
    draggedCells: new Map(),
  };
}
