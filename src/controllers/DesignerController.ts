import { produce } from "immer";
import { CellState } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";
import { encodePuzzle } from "../utils/puzzleCodec";
import { getDifficultyRating } from "../utils/difficultyAnalyzer";
import { DesignerState, createEmptyGrid } from "./DesignerState";

/**
 * Controller for puzzle designer logic.
 * All methods are pure - they take state and return new state.
 * Uses Immer for immutable updates with minimal boilerplate.
 */
export class DesignerController {
  toggleCell(state: DesignerState, row: number, col: number): DesignerState {
    return produce(state, draft => {
      const newValue = draft.grid[row][col] === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;
      draft.grid[row][col] = newValue;
      draft.rowHints = deriveRowHints(draft.grid);
      draft.columnHints = deriveColumnHints(draft.grid);
      draft.hasUniqueSolution = null;
      draft.difficulty = null;
    });
  }

  // Drag operations
  private hasDraggedCell(draggedCells: Map<number, Set<number>>, row: number, col: number): boolean {
    return draggedCells.get(row)?.has(col) ?? false;
  }

  startDrag(state: DesignerState, row: number, col: number): DesignerState {
    const currentCell = state.grid[row][col];
    const dragMode = currentCell === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;

    return produce(state, draft => {
      draft.grid[row][col] = dragMode;
      draft.rowHints = deriveRowHints(draft.grid);
      draft.columnHints = deriveColumnHints(draft.grid);
      draft.hasUniqueSolution = null;
      draft.difficulty = null;
      draft.isDragging = true;
      draft.dragMode = dragMode;
      draft.draggedCells = new Map([[row, new Set([col])]]);
    });
  }

  continueDrag(state: DesignerState, row: number, col: number): DesignerState {
    if (!state.isDragging || state.dragMode === null) {
      return state;
    }

    if (this.hasDraggedCell(state.draggedCells, row, col)) {
      return state;
    }

    const dragMode = state.dragMode;
    return produce(state, draft => {
      draft.grid[row][col] = dragMode;
      draft.rowHints = deriveRowHints(draft.grid);
      draft.columnHints = deriveColumnHints(draft.grid);
      draft.hasUniqueSolution = null;
      draft.difficulty = null;
      
      // Update draggedCells Map
      const rowSet = draft.draggedCells.get(row) ?? new Set<number>();
      rowSet.add(col);
      draft.draggedCells.set(row, rowSet);
    });
  }

  endDrag(state: DesignerState): DesignerState {
    return produce(state, draft => {
      draft.isDragging = false;
      draft.dragMode = null;
      draft.draggedCells = new Map();
    });
  }

  setSize(state: DesignerState, size: number): DesignerState {
    const grid = createEmptyGrid(size);
    return produce(state, draft => {
      draft.size = size;
      draft.grid = grid;
      draft.rowHints = deriveRowHints(grid);
      draft.columnHints = deriveColumnHints(grid);
      draft.hasUniqueSolution = null;
      draft.difficulty = null;
    });
  }

  setPuzzleName(state: DesignerState, name: string): DesignerState {
    return produce(state, draft => {
      draft.puzzleName = name;
    });
  }

  clear(state: DesignerState): DesignerState {
    const grid = createEmptyGrid(state.size);
    return produce(state, draft => {
      draft.grid = grid;
      draft.rowHints = deriveRowHints(grid);
      draft.columnHints = deriveColumnHints(grid);
      draft.hasUniqueSolution = null;
      draft.difficulty = null;
    });
  }

  setChecking(state: DesignerState, isChecking: boolean): DesignerState {
    return produce(state, draft => {
      draft.isChecking = isChecking;
    });
  }

  setUniqueSolution(state: DesignerState, hasUniqueSolution: boolean | null): DesignerState {
    return produce(state, draft => {
      draft.hasUniqueSolution = hasUniqueSolution;
      draft.isChecking = false;
      // Calculate difficulty if puzzle is valid
      if (hasUniqueSolution === true) {
        draft.difficulty = getDifficultyRating(state.grid);
      } else {
        draft.difficulty = null;
      }
    });
  }

  hasFilledCells(state: DesignerState): boolean {
    return state.grid.some(row => row.some(cell => cell === CellState.FILLED));
  }

  exportJson(state: DesignerState): string {
    const puzzleJson = {
      name: state.puzzleName.trim() || "Untitled",
      solution: state.grid,
    };
    return JSON.stringify(puzzleJson, null, 2);
  }

  getShareUrl(state: DesignerState): string {
    const name = state.puzzleName.trim() || "Untitled";
    const difficulty = state.difficulty ?? 0;
    const encoded = encodePuzzle(name, state.grid, difficulty);
    return `${window.location.origin}${window.location.pathname}#/play/${encoded}`;
  }

  getStatusInfo(state: DesignerState): { message: string; className: string; difficulty: number | null } {
    if (!this.hasFilledCells(state)) {
      return { message: "Draw your puzzle by clicking cells", className: "status-info", difficulty: null };
    }
    if (state.isChecking) {
      return { message: "Checking solution...", className: "status-checking", difficulty: null };
    }
    if (state.hasUniqueSolution === true) {
      const difficultyText = state.difficulty ? ` (Difficulty: ${state.difficulty}/5)` : '';
      return { message: `✓︎ Puzzle has a unique solution!${difficultyText}`, className: "status-valid", difficulty: state.difficulty };
    }
    if (state.hasUniqueSolution === false) {
      return { message: "✗︎ Puzzle does not have a unique solution", className: "status-invalid", difficulty: null };
    }
    return { message: "", className: "", difficulty: null };
  }
}
