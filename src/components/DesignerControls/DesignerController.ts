import { produce } from "immer";
import { CellState, PuzzleSolutionData } from "../../types/nonogram";
import { puzzleService } from "../../services/Puzzle";
import { puzzleCodec } from "../../services/PuzzleCodec";
import { difficultyAnalyzer } from "../../services/DifficultyAnalyzer";
import { DesignerState, createEmptySolutionGrid } from "./DesignerState";
import { SavedDesign } from "../../types/design";

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
      draft.rowHints = puzzleService.deriveRowHints(draft.grid);
      draft.columnHints = puzzleService.deriveColumnHints(draft.grid);
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
      draft.rowHints = puzzleService.deriveRowHints(draft.grid);
      draft.columnHints = puzzleService.deriveColumnHints(draft.grid);
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
      draft.rowHints = puzzleService.deriveRowHints(draft.grid);
      draft.columnHints = puzzleService.deriveColumnHints(draft.grid);
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

  setSize(state: DesignerState, height: number, width: number): DesignerState {
    const grid = createEmptySolutionGrid(height, width);
    return produce(state, draft => {
      draft.height = height;
      draft.width = width;
      draft.grid = grid;
      draft.rowHints = puzzleService.deriveRowHints(grid);
      draft.columnHints = puzzleService.deriveColumnHints(grid);
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
    const grid = createEmptySolutionGrid(state.height, state.width);
    return produce(state, draft => {
      draft.grid = grid;
      draft.rowHints = puzzleService.deriveRowHints(grid);
      draft.columnHints = puzzleService.deriveColumnHints(grid);
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
        draft.difficulty = difficultyAnalyzer.getRating(state.grid);
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
    const encoded = puzzleCodec.encode(name, state.grid, difficulty);
    return `${window.location.origin}${window.location.pathname}#/play/${encoded}`;
  }

  getStatusInfo(state: DesignerState): { message: string; variant: 'info' | 'success' | 'error'; difficulty: number | null } {
    if (!this.hasFilledCells(state)) {
      return { message: "Draw your puzzle by clicking cells", variant: "info", difficulty: null };
    }
    if (state.isChecking) {
      return { message: "Checking solution...", variant: "info", difficulty: null };
    }
    if (state.hasUniqueSolution === true) {
      const difficultyText = state.difficulty ? ` (Difficulty: ${String(state.difficulty)}/5)` : '';
      return { message: `✓︎ Puzzle has a unique solution!${difficultyText}`, variant: "success", difficulty: state.difficulty };
    }
    if (state.hasUniqueSolution === false) {
      return { message: "✗︎ Puzzle does not have a unique solution", variant: "error", difficulty: null };
    }
    return { message: "", variant: "info", difficulty: null };
  }

  // Load a saved design into the designer
  loadDesign(state: DesignerState, design: SavedDesign): DesignerState {
    // Ensure grid is properly typed as SolutionCell[][]
    const grid: PuzzleSolutionData = design.solution.map(row => 
      row.map(cell => (cell as number) === 1 ? CellState.FILLED : CellState.EMPTY)
    );
    
    return produce(state, draft => {
      draft.height = design.height;
      draft.width = design.width;
      draft.grid = grid;
      draft.puzzleName = design.name;
      draft.rowHints = puzzleService.deriveRowHints(grid);
      draft.columnHints = puzzleService.deriveColumnHints(grid);
      draft.hasUniqueSolution = null; // Will be rechecked
      draft.difficulty = design.difficulty;
    });
  }
}
