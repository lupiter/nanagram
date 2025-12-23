import { CellState } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";
import { DesignerState, createEmptyGrid } from "./DesignerState";

/**
 * Controller for puzzle designer logic.
 * All methods are pure - they take state and return new state.
 */
export class DesignerController {
  toggleCell(state: DesignerState, row: number, col: number): DesignerState {
    const newGrid = state.grid.map(r => [...r]);
    newGrid[row][col] = newGrid[row][col] === CellState.FILLED
      ? CellState.EMPTY
      : CellState.FILLED;

    return {
      ...state,
      grid: newGrid,
      rowHints: deriveRowHints(newGrid),
      columnHints: deriveColumnHints(newGrid),
      hasUniqueSolution: null, // Reset when grid changes
    };
  }

  setSize(state: DesignerState, size: number): DesignerState {
    const grid = createEmptyGrid(size);
    return {
      ...state,
      size,
      grid,
      rowHints: deriveRowHints(grid),
      columnHints: deriveColumnHints(grid),
      hasUniqueSolution: null,
    };
  }

  setPuzzleName(state: DesignerState, name: string): DesignerState {
    return { ...state, puzzleName: name };
  }

  clear(state: DesignerState): DesignerState {
    const grid = createEmptyGrid(state.size);
    return {
      ...state,
      grid,
      rowHints: deriveRowHints(grid),
      columnHints: deriveColumnHints(grid),
      hasUniqueSolution: null,
    };
  }

  setChecking(state: DesignerState, isChecking: boolean): DesignerState {
    return { ...state, isChecking };
  }

  setUniqueSolution(state: DesignerState, hasUniqueSolution: boolean | null): DesignerState {
    return { ...state, hasUniqueSolution, isChecking: false };
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

  getStatusInfo(state: DesignerState): { message: string; className: string } {
    if (!this.hasFilledCells(state)) {
      return { message: "Draw your puzzle by clicking cells", className: "status-info" };
    }
    if (state.isChecking) {
      return { message: "Checking solution...", className: "status-checking" };
    }
    if (state.hasUniqueSolution === true) {
      return { message: "✓ Puzzle has a unique solution!", className: "status-valid" };
    }
    if (state.hasUniqueSolution === false) {
      return { message: "✗ Puzzle does not have a unique solution", className: "status-invalid" };
    }
    return { message: "", className: "" };
  }
}

