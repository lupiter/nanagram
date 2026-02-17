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

  const mode = savedMode ?? GameMode.Assisted;
  const height = grid.length;
  const width = grid[0].length;

  // Autofill rows/columns with no clues (crosses) – not in Correction mode
  if (mode !== GameMode.Correction) {
    grid = grid.map((row, i) =>
      row.map((cell, j) =>
        rowHints[i].length === 0 || columnHints[j].length === 0 ? CellState.CROSSED_OUT : cell
      )
    );
  }

  // Assisted mode only: autofill rows/columns where the single clue equals line length
  if (mode === GameMode.Assisted) {
    grid = grid.map((row, i) =>
      row.map((cell, j) => {
        const rowFull =
          rowHints[i].length === 1 && rowHints[i][0].hint === width;
        const colFull =
          columnHints[j].length === 1 && columnHints[j][0].hint === height;
        return rowFull || colFull ? CellState.FILLED : cell;
      })
    );
  }

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
