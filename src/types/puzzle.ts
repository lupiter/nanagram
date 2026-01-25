import { CellState as NonogramCellState, PuzzleSolutionData, Hint, GameState } from './nonogram';

export enum GameMode {
  Free = 'free',
  Assisted = 'assisted'
}

/** Decoded puzzle from URL */
export interface DecodedPuzzle {
  name: string;
  solution: PuzzleSolutionData;
  difficulty: number;
}

/** Generated random puzzle */
export interface GeneratedPuzzle {
  solution: PuzzleSolutionData;
  difficulty: number;
}

/** Location of a puzzle in the library */
export interface PuzzleLocation {
  category: string;
  id: string;
}

/** Difficulty analysis metrics */
export interface DifficultyMetrics {
  difficulty: number;           // 1-5 rating
  firstPassCells: number;       // Cells solved in first pass
  totalCells: number;           // Total cells in puzzle
  firstPassPercent: number;     // Percentage solved in first pass
  iterations: number;           // Total solver iterations needed
  initialForcedCells: number;   // Cells forced by single-line analysis alone
  avgPossibilities: number;     // Average initial possibilities per line
}

/** Options for updating a cell */
export interface UpdateCellOptions {
  grid: GameState;
  puzzle: PuzzleSolutionData;
  row: number;
  col: number;
  toolToUse: NonogramCellState;
  mode: GameMode;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

/** Result of updating a cell */
export interface UpdateCellResult {
  newGrid: GameState;
  newRowHints: Hint[][];
  newColumnHints: Hint[][];
  errorCell: [number, number] | null;
}

/** Context for puzzle controller */
export interface PuzzleContext {
  category: string;
  id: string;
  solution: PuzzleSolutionData;
}

/** History entry for undo/redo */
export interface HistoryEntry {
  grid: GameState;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

/** State for playing a puzzle */
export interface PuzzleState {
  // Core game state
  grid: GameState;
  rowHints: Hint[][];
  columnHints: Hint[][];
  tool: NonogramCellState;
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
  dragTool: NonogramCellState | null;
  draggedCells: Map<number, Set<number>>;
}

/** Props for the NonogramGrid component */
export interface NonogramGridProps {
  grid: number[][];
  rowHints: Hint[][];
  columnHints: Hint[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseDown?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  errorCell?: [number, number] | null;
}