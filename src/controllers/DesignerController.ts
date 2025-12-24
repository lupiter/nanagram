import { CellState } from "../types/nonogram";
import { deriveRowHints, deriveColumnHints } from "../utils/puzzleUtils";
import { encodePuzzle } from "../utils/puzzleCodec";
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

  // Drag operations
  private hasDraggedCell(draggedCells: Map<number, Set<number>>, row: number, col: number): boolean {
    return draggedCells.get(row)?.has(col) ?? false;
  }

  private addDraggedCell(draggedCells: Map<number, Set<number>>, row: number, col: number): Map<number, Set<number>> {
    const newMap = new Map(draggedCells);
    const rowSet = newMap.get(row) ?? new Set<number>();
    rowSet.add(col);
    newMap.set(row, rowSet);
    return newMap;
  }

  startDrag(state: DesignerState, row: number, col: number): DesignerState {
    const currentCell = state.grid[row][col];
    // Determine what we're filling with: opposite of current cell state
    const dragMode = currentCell === CellState.FILLED ? CellState.EMPTY : CellState.FILLED;
    
    const newGrid = state.grid.map(r => [...r]);
    newGrid[row][col] = dragMode;
    
    const draggedCells = this.addDraggedCell(new Map(), row, col);

    return {
      ...state,
      grid: newGrid,
      rowHints: deriveRowHints(newGrid),
      columnHints: deriveColumnHints(newGrid),
      hasUniqueSolution: null,
      isDragging: true,
      dragMode,
      draggedCells,
    };
  }

  continueDrag(state: DesignerState, row: number, col: number): DesignerState {
    if (!state.isDragging || state.dragMode === null) {
      return state;
    }

    if (this.hasDraggedCell(state.draggedCells, row, col)) {
      return state;
    }

    const newGrid = state.grid.map(r => [...r]);
    newGrid[row][col] = state.dragMode;

    const draggedCells = this.addDraggedCell(state.draggedCells, row, col);

    return {
      ...state,
      grid: newGrid,
      rowHints: deriveRowHints(newGrid),
      columnHints: deriveColumnHints(newGrid),
      hasUniqueSolution: null,
      draggedCells,
    };
  }

  endDrag(state: DesignerState): DesignerState {
    return {
      ...state,
      isDragging: false,
      dragMode: null,
      draggedCells: new Map(),
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
      return { message: "✓ Puzzle has a unique solution!", className: "status-valid" };
    }
    if (state.hasUniqueSolution === false) {
      return { message: "✗ Puzzle does not have a unique solution", className: "status-invalid" };
    }
    return { message: "", className: "" };
  }
}

