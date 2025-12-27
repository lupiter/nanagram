

export enum CellState {
  EMPTY = 0,
  FILLED = 1,
  CROSSED_OUT = 2
}

export type Cell = CellState.EMPTY | CellState.FILLED | CellState.CROSSED_OUT;

// Represents a single cell in the puzzle
export type SolutionCell = CellState.EMPTY | CellState.FILLED;

// Represents a hint for a row or column
export interface Hint {
  hint: number;
  used: boolean;
}

// Represents the raw puzzle data
export type PuzzleSolutionData = SolutionCell[][];

// Represents a puzzle definition with metadata
export interface PuzzleDefinition {
  name: string;
  difficulty: number; // 1-5 rating
  solution: PuzzleSolutionData;
}

// Represents the current state of the game
export type GameState = Cell[][];

// Represents a complete puzzle with its current state
export interface Puzzle {
  solution: PuzzleSolutionData;
  state: GameState;
  rowHints: Hint[][];    // Derived from solution
  columnHints: Hint[][]; // Derived from solution
} 