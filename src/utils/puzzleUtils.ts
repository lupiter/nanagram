import {
  GameState,
  Hint,
  PuzzleSolutionData,
  CellState,
  Cell,
} from "../types/nonogram";
import { NonogramSolver } from "./nonogramSolver";

/**
 * Creates an empty game state for a puzzle of given dimensions
 */
export function createEmptyGameState(width: number, height: number): GameState {
  const cells = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => CellState.EMPTY)
  );
  return cells;
}

/**
 * Derives hints for all rows in a puzzle
 */
export function deriveRowHints(solution: PuzzleSolutionData): Hint[][] {
  return solution.map((row) => {
    const hints: Hint[] = [];
    let currentCount = 0;

    for (const cell of row) {
      if (cell === CellState.FILLED) {
        currentCount++;
      } else if (currentCount > 0) {
        hints.push({ hint: currentCount, used: false });
        currentCount = 0;
      }
    }

    if (currentCount > 0) {
      hints.push({ hint: currentCount, used: false });
    }

    return hints;
  });
}

/**
 * Derives hints for all columns in a puzzle
 */
export function deriveColumnHints(solution: PuzzleSolutionData): Hint[][] {
  const width = solution[0]?.length ?? 0;
  const height = solution.length;
  const hints: Hint[][] = [];

  for (let col = 0; col < width; col++) {
    const columnHints: Hint[] = [];
    let currentCount = 0;

    for (let row = 0; row < height; row++) {
      if (solution[row][col] === CellState.FILLED) {
        currentCount++;
      } else if (currentCount > 0) {
        columnHints.push({ hint: currentCount, used: false });
        currentCount = 0;
      }
    }

    if (currentCount > 0) {
      columnHints.push({ hint: currentCount, used: false });
    }

    hints.push(columnHints);
  }

  return hints;
}

/**
 * Validates that a puzzle has valid dimensions and cell values
 */
export function validatePuzzle(solution: PuzzleSolutionData): boolean {
  if (solution.length === 0) {
    return false;
  }

  const width = solution[0]?.length ?? 0;

  if (width === 0) {
    return false;
  }

  // Check that all rows have the same width and valid cell values
  for (const row of solution) {
    if (row.length !== width) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the current game state matches the solution
 */
export function checkSolution(
  solution: PuzzleSolutionData,
  gameState: GameState
): boolean {
  const height = solution.length;
  const width = solution[0]?.length ?? 0;

  // Check dimensions
  if (
    gameState.length !== height ||
    gameState.some((row) => row.length !== width)
  ) {
    return false;
  }

  // Check each cell
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const gameCell = gameState[i][j];
      const solutionCell = solution[i][j];

      if (
        (gameCell === CellState.CROSSED_OUT && solutionCell === CellState.FILLED) ||
        (gameCell === CellState.FILLED && solutionCell === CellState.EMPTY) ||
        (gameCell === CellState.EMPTY && solutionCell === CellState.FILLED)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function generatePossibleDataForHints(
  hints: Hint[],
  size: number
): Cell[][] {
  if (hints.length === 0) {
    // No hints = all empty
    return [Array(size).fill(CellState.EMPTY)];
  }

  const solutions: Cell[][] = [];
  
  // Recursive function to place hints
  function placeHints(
    hintIndex: number,
    startPos: number,
    currentSolution: Cell[]
  ): void {
    if (hintIndex >= hints.length) {
      // All hints placed, fill remaining with EMPTY
      const solution = [...currentSolution];
      while (solution.length < size) {
        solution.push(CellState.EMPTY);
      }
      solutions.push(solution);
      return;
    }

    const hint = hints[hintIndex];
    const remainingHints = hints.slice(hintIndex + 1);
    const minSpaceNeeded = remainingHints.reduce((acc, h) => acc + h.hint + 1, 0);
    const maxStartPos = size - hint.hint - minSpaceNeeded;

    for (let pos = startPos; pos <= maxStartPos; pos++) {
      // Build solution up to this point
      const solution = [...currentSolution];
      
      // Add EMPTY cells before this hint
      while (solution.length < pos) {
        solution.push(CellState.EMPTY);
      }
      
      // Add FILLED cells for this hint
      for (let i = 0; i < hint.hint; i++) {
        solution.push(CellState.FILLED);
      }
      
      // Recurse for next hint (must have at least 1 gap)
      placeHints(hintIndex + 1, solution.length + 1, solution);
    }
  }

  placeHints(0, 0, []);
  return solutions;
}

export function checkPuzzleHasUniqueSolution(
  solution: PuzzleSolutionData
): boolean {
  const rowHints = deriveRowHints(solution).map((row) => row.map((hint) => hint.hint));
  const columnHints = deriveColumnHints(solution).map((column) => column.map((hint) => hint.hint));

  const solver = new NonogramSolver(rowHints, columnHints);
  solver.solve();
  
  return checkSolution(solution, solver.board);
}

export function isRowOrColumnComplete(
  solution: PuzzleSolutionData,
  gameState: GameState,
  isRow: boolean,
  index: number
): boolean {
  const line = isRow ? gameState[index] : gameState.map(row => row[index]);
  const solutionLine = isRow ? solution[index] : solution.map(row => row[index]);

  for (let i = 0; i < line.length; i++) {
    // For a line to be complete, cells must match exactly
    const currentCell = line[i];
    const solutionCell = solutionLine[i];
    
    if (currentCell === CellState.EMPTY && solutionCell === CellState.FILLED) {
      return false;
    }
  }

  return true;
}
