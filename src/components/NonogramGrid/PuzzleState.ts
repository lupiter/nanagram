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
  const grid = savedGrid ?? puzzleService.createEmptyGameState(solution[0].length, solution.length);

  return {
    grid,
    rowHints: puzzleService.deriveRowHints(solution),
    columnHints: puzzleService.deriveColumnHints(solution),
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
