import { produce } from "immer";
import { WorkingGrid, GameMode } from "../types/puzzle";
import { CellState, PuzzleSolutionData } from "../types/nonogram";
import {
  deriveRowHints,
  deriveColumnHints,
  checkSolution,
  createEmptyGameState,
} from "../utils/puzzleUtils";
import { updateCell } from "../utils/updateCell";
import { PuzzleState, HistoryEntry, createInitialState } from "./PuzzleState";

export interface PuzzleContext {
  category: string;
  id: string;
  solution: PuzzleSolutionData;
}

/**
 * Controller for puzzle game logic.
 * All methods are pure - they take state and return new state.
 * Uses Immer for immutable updates with minimal boilerplate.
 */
export class PuzzleController {
  private context: PuzzleContext;

  constructor(context: PuzzleContext) {
    this.context = context;
  }

  createInitialState(savedGrid?: WorkingGrid | null, savedMode?: GameMode | null): PuzzleState {
    return createInitialState(this.context.solution, savedGrid, savedMode);
  }

  // --- Cell Updates ---

  updateCell(state: PuzzleState, row: number, col: number, toolOverride?: CellState): PuzzleState {
    const result = updateCell({
      grid: state.grid,
      puzzle: this.context.solution,
      row,
      col,
      toolToUse: toolOverride ?? state.tool,
      mode: state.mode,
      rowHints: state.rowHints,
      columnHints: state.columnHints,
    });

    let newState = produce(state, draft => {
      draft.grid = result.newGrid;
      draft.rowHints = result.newRowHints;
      draft.columnHints = result.newColumnHints;
      draft.errorCell = result.errorCell;
    });

    // Add to history if not an undo/redo action
    if (!state.isUndoRedoAction) {
      newState = this.addToHistory(newState);
    }

    return produce(newState, draft => {
      draft.isUndoRedoAction = false;
    });
  }

  handleRightClick(state: PuzzleState, row: number, col: number): PuzzleState {
    const oppositeTool = state.tool === CellState.FILLED ? CellState.CROSSED_OUT : CellState.FILLED;
    return this.updateCell(state, row, col, oppositeTool);
  }

  // --- Tool & Mode ---

  setTool(state: PuzzleState, tool: CellState): PuzzleState {
    return produce(state, draft => {
      draft.tool = tool;
    });
  }

  setMode(state: PuzzleState, mode: GameMode): PuzzleState {
    return produce(state, draft => {
      draft.mode = mode;
    });
  }

  // --- Victory ---

  setShowVictory(state: PuzzleState, show: boolean): PuzzleState {
    return produce(state, draft => {
      draft.showVictory = show;
    });
  }

  checkSolution(state: PuzzleState): { isSolved: boolean; justSolved: boolean } {
    const isSolved = checkSolution(this.context.solution, state.grid);
    const justSolved = isSolved && !state.isSolved;
    return { isSolved, justSolved };
  }

  markSolved(state: PuzzleState): PuzzleState {
    return produce(state, draft => {
      draft.isSolved = true;
      draft.showVictory = true;
    });
  }

  // --- Error ---

  clearError(state: PuzzleState): PuzzleState {
    return produce(state, draft => {
      draft.errorCell = null;
    });
  }

  // --- Reset ---

  reset(state: PuzzleState): PuzzleState {
    return produce(state, draft => {
      draft.grid = createEmptyGameState(this.context.solution[0].length, this.context.solution.length);
      draft.rowHints = deriveRowHints(this.context.solution);
      draft.columnHints = deriveColumnHints(this.context.solution);
      draft.isSolved = false;
      draft.showVictory = false;
      draft.history = [];
      draft.historyIndex = -1;
      draft.errorCell = null;
      draft.isUndoRedoAction = false;
    });
  }

  // --- Undo/Redo ---

  canUndo(state: PuzzleState): boolean {
    return state.historyIndex >= 0;
  }

  canRedo(state: PuzzleState): boolean {
    return state.historyIndex < state.history.length - 1;
  }

  undo(state: PuzzleState): PuzzleState {
    if (state.historyIndex > 0) {
      const prevEntry = state.history[state.historyIndex - 1];
      return produce(state, draft => {
        draft.grid = prevEntry.grid;
        draft.rowHints = prevEntry.rowHints;
        draft.columnHints = prevEntry.columnHints;
        draft.historyIndex = state.historyIndex - 1;
        draft.isUndoRedoAction = true;
      });
    } else if (state.historyIndex === 0) {
      return produce(state, draft => {
        draft.grid = createEmptyGameState(this.context.solution[0].length, this.context.solution.length);
        draft.rowHints = deriveRowHints(this.context.solution);
        draft.columnHints = deriveColumnHints(this.context.solution);
        draft.historyIndex = -1;
        draft.isUndoRedoAction = true;
      });
    }
    return state;
  }

  redo(state: PuzzleState): PuzzleState {
    if (state.historyIndex < state.history.length - 1) {
      const nextEntry = state.history[state.historyIndex + 1];
      return produce(state, draft => {
        draft.grid = nextEntry.grid;
        draft.rowHints = nextEntry.rowHints;
        draft.columnHints = nextEntry.columnHints;
        draft.historyIndex = state.historyIndex + 1;
        draft.isUndoRedoAction = true;
      });
    }
    return state;
  }

  // --- Drag ---

  private hasDraggedCell(draggedCells: Map<number, Set<number>>, row: number, col: number): boolean {
    return draggedCells.get(row)?.has(col) ?? false;
  }

  startDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    const stateWithDrag = produce(state, draft => {
      draft.isDragging = true;
      draft.dragTool = state.tool;
      draft.draggedCells = new Map([[row, new Set([col])]]);
    });
    
    // Update the first cell
    return this.updateCell(stateWithDrag, row, col, state.tool);
  }

  continueDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    if (!state.isDragging || state.dragTool === null) {
      return state;
    }

    if (this.hasDraggedCell(state.draggedCells, row, col)) {
      return state;
    }

    const stateWithDrag = produce(state, draft => {
      const rowSet = draft.draggedCells.get(row) ?? new Set<number>();
      rowSet.add(col);
      draft.draggedCells.set(row, rowSet);
    });
    
    return this.updateCell(stateWithDrag, row, col, state.dragTool);
  }

  endDrag(state: PuzzleState): PuzzleState {
    return produce(state, draft => {
      draft.isDragging = false;
      draft.dragTool = null;
      draft.draggedCells = new Map();
    });
  }

  // --- Helpers ---

  hasContent(state: PuzzleState): boolean {
    return state.grid.some(row => row.some(cell => cell !== CellState.EMPTY));
  }

  private addToHistory(state: PuzzleState): PuzzleState {
    if (!this.hasContent(state)) {
      return state;
    }

    const newEntry: HistoryEntry = {
      grid: state.grid,
      rowHints: state.rowHints,
      columnHints: state.columnHints,
    };

    return produce(state, draft => {
      draft.history = [...state.history.slice(0, state.historyIndex + 1), newEntry];
      draft.historyIndex = draft.history.length - 1;
    });
  }
}
