import { GameMode, PuzzleState, PuzzleStatus } from "../../types/puzzle";
import { GameState, CellState, PuzzleSolutionData } from "../../types/nonogram";
import { puzzleService } from "../../services/Puzzle";
import { hintChecker } from "../../services/HintChecker";

export function createInitialState(
  solution: PuzzleSolutionData,
  savedGrid?: GameState | null,
  savedMode?: GameMode | null,
): PuzzleState {
  const rowHints = puzzleService.deriveRowHints(solution);
  const columnHints = puzzleService.deriveColumnHints(solution);
  let grid =
    savedGrid ??
    puzzleService.createEmptyGameState(solution[0].length, solution.length);

  const mode = savedMode ?? GameMode.Assisted;
  const height = grid.length;
  const width = grid[0].length;

  // Autofill in Assisted mode
  if (mode === GameMode.Assisted) {
    grid = grid.map((row, i) =>
      row.map((cell, j) => {
        const rowFull =
          rowHints[i].length === 1 && rowHints[i][0].hint === width;
        const colFull =
          columnHints[j].length === 1 && columnHints[j][0].hint === height;
        if (rowFull || colFull) return CellState.FILLED;
        return rowHints[i].length === 0 || columnHints[j].length === 0
          ? CellState.CROSSED_OUT
          : cell;
      }),
    );
  }

  // Always recompute used flags from current grid (e.g. when loading saved progress)
  const checkedRowHints = grid.map((row, i) =>
    hintChecker.check(row, rowHints[i], solution[i]),
  );
  const checkedColumnHints = grid[0].map((_, col) => {
    const column = grid.map((r) => r[col]);
    const answerColumn = solution.map((r) => r[col]);
    return hintChecker.check(column, columnHints[col], answerColumn);
  });

  return {
    grid,
    rowHints: checkedRowHints,
    columnHints: checkedColumnHints,
    tool: CellState.FILLED,
    mode: savedMode ?? GameMode.Assisted,
    status: PuzzleStatus.Playing,
    errorCell: null,
    history: [],
    historyIndex: -1,
    isUndoRedoAction: false,
  };
}
