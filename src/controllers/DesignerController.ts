import { produce } from "immer";
import { CellState } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";
import { encodePuzzle } from "../utils/puzzleCodec";
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
    const encoded = encodePuzzle(name, state.grid);
    return `${window.location.origin}${window.location.pathname}#/play/${encoded}`;
  }

  getStatusInfo(state: DesignerState): { message: string; className: string } {
    if (!this.hasFilledCells(state)) {
      return { message: "Draw your puzzle by clicking cells", className: "status-info" };
    }
    if (state.isChecking) {
      return { message: "Checking solution...", className: "status-checking" };
    }
    if (state.hasUniqueSolution === true) {
      return { message: "✓︎ Puzzle has a unique solution!", className: "status-valid" };
    }
    if (state.hasUniqueSolution === false) {
      return { message: "✗︎ Puzzle does not have a unique solution", className: "status-invalid" };
    }
    return { message: "", className: "" };
  }
}
