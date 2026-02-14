import { GameMode, HistoryEntry, PuzzleState } from "../../types/puzzle";
import { GameState, CellState, PuzzleSolutionData } from "../../types/nonogram";
import { puzzleService } from "../../services/Puzzle";

// Re-export for convenience
export type { HistoryEntry, PuzzleState };

export function createInitialState(
  solution: PuzzleSolutionData,
  savedGrid?: GameState | null,
  savedMode?: GameMode | null
): PuzzleState {
  const rowHints = puzzleService.deriveRowHints(solution);
  const columnHints = puzzleService.deriveColumnHints(solution);
  let grid = savedGrid ?? puzzleService.createEmptyGameState(solution[0].length, solution.length);

  // Autofill rows/columns with no clues (all cells in that line are crosses)
  grid = grid.map((row, i) =>
    row.map((cell, j) =>
      rowHints[i].length === 0 || columnHints[j].length === 0 ? CellState.CROSSED_OUT : cell
    )
  );

  return {
    grid,
    rowHints,
    columnHints,
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
