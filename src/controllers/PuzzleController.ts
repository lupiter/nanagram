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
 * No React dependencies. Fully unit testable.
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

    let newState: PuzzleState = {
      ...state,
      grid: result.newGrid,
      rowHints: result.newRowHints,
      columnHints: result.newColumnHints,
      errorCell: result.errorCell,
    };

    // Add to history if not an undo/redo action
    if (!state.isUndoRedoAction) {
      newState = this.addToHistory(newState);
    }

    return { ...newState, isUndoRedoAction: false };
  }

  handleRightClick(state: PuzzleState, row: number, col: number): PuzzleState {
    const oppositeTool = state.tool === CellState.FILLED ? CellState.CROSSED_OUT : CellState.FILLED;
    return this.updateCell(state, row, col, oppositeTool);
  }

  // --- Tool & Mode ---

  setTool(state: PuzzleState, tool: CellState): PuzzleState {
    return { ...state, tool };
  }

  setMode(state: PuzzleState, mode: GameMode): PuzzleState {
    return { ...state, mode };
  }

  // --- Victory ---

  setShowVictory(state: PuzzleState, show: boolean): PuzzleState {
    return { ...state, showVictory: show };
  }

  checkSolution(state: PuzzleState): { isSolved: boolean; justSolved: boolean } {
    const isSolved = checkSolution(this.context.solution, state.grid);
    const justSolved = isSolved && !state.isSolved;
    return { isSolved, justSolved };
  }

  markSolved(state: PuzzleState): PuzzleState {
    return { ...state, isSolved: true, showVictory: true };
  }

  // --- Error ---

  clearError(state: PuzzleState): PuzzleState {
    return { ...state, errorCell: null };
  }

  // --- Reset ---

  reset(state: PuzzleState): PuzzleState {
    return {
      ...state,
      grid: createEmptyGameState(this.context.solution[0].length, this.context.solution.length),
      rowHints: deriveRowHints(this.context.solution),
      columnHints: deriveColumnHints(this.context.solution),
      isSolved: false,
      showVictory: false,
      history: [],
      historyIndex: -1,
      errorCell: null,
      isUndoRedoAction: false,
    };
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
      return {
        ...state,
        grid: prevEntry.grid.map(row => [...row]),
        rowHints: prevEntry.rowHints.map(hints => hints.map(h => ({ ...h }))),
        columnHints: prevEntry.columnHints.map(hints => hints.map(h => ({ ...h }))),
        historyIndex: state.historyIndex - 1,
        isUndoRedoAction: true,
      };
    } else if (state.historyIndex === 0) {
      return {
        ...state,
        grid: createEmptyGameState(this.context.solution[0].length, this.context.solution.length),
        rowHints: deriveRowHints(this.context.solution),
        columnHints: deriveColumnHints(this.context.solution),
        historyIndex: -1,
        isUndoRedoAction: true,
      };
    }
    return state;
  }

  redo(state: PuzzleState): PuzzleState {
    if (state.historyIndex < state.history.length - 1) {
      const nextEntry = state.history[state.historyIndex + 1];
      return {
        ...state,
        grid: nextEntry.grid.map(row => [...row]),
        rowHints: nextEntry.rowHints.map(hints => hints.map(h => ({ ...h }))),
        columnHints: nextEntry.columnHints.map(hints => hints.map(h => ({ ...h }))),
        historyIndex: state.historyIndex + 1,
        isUndoRedoAction: true,
      };
    }
    return state;
  }

  // --- Drag ---

  startDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    const newDraggedCells = new Set<string>();
    newDraggedCells.add(`${row}-${col}`);
    return {
      ...state,
      isDragging: true,
      dragTool: state.tool,
      draggedCells: newDraggedCells,
    };
  }

  continueDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    if (!state.isDragging || state.dragTool === null) {
      return state;
    }

    const cellKey = `${row}-${col}`;
    if (state.draggedCells.has(cellKey)) {
      return state;
    }

    const newDraggedCells = new Set(state.draggedCells);
    newDraggedCells.add(cellKey);

    const stateWithDrag = { ...state, draggedCells: newDraggedCells };
    return this.updateCell(stateWithDrag, row, col, state.dragTool);
  }

  endDrag(state: PuzzleState): PuzzleState {
    return {
      ...state,
      isDragging: false,
      dragTool: null,
      draggedCells: new Set(),
    };
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
      grid: state.grid.map(row => [...row]),
      rowHints: state.rowHints.map(hints => hints.map(h => ({ ...h }))),
      columnHints: state.columnHints.map(hints => hints.map(h => ({ ...h }))),
    };

    const newHistory = [...state.history.slice(0, state.historyIndex + 1), newEntry];
    return {
      ...state,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  }
}
