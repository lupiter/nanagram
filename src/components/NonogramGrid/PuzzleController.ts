import { produce } from "immer";
import {
  GameMode,
  PuzzleContext,
  PuzzleEvent,
  PuzzleStatus,
  HistoryEntry,
} from "../../types/puzzle";
import { GameState, CellState } from "../../types/nonogram";
import { puzzleService } from "../../services/Puzzle";
import { cellUpdater } from "../../services/CellUpdater";
import { PuzzleState, createInitialState } from "./PuzzleState";

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

  createInitialState(
    savedGrid?: GameState | null,
    savedMode?: GameMode | null,
  ): PuzzleState {
    return createInitialState(this.context.solution, savedGrid, savedMode);
  }

  dispatch(state: PuzzleState, event: PuzzleEvent): PuzzleState {
    switch (event.type) {
      case "CELL_CLICKED": {
        if (state.status === PuzzleStatus.Solved) return state;

        let newState = this.updateCell(
          state,
          event.row,
          event.col,
          event.toolOverride,
        );

        if (newState.errorCell) {
          newState = produce(newState, (draft) => {
            draft.status = PuzzleStatus.Error;
          });
        } else if (state.status === PuzzleStatus.Error) {
          newState = produce(newState, (draft) => {
            draft.status = PuzzleStatus.Playing;
          });
        }

        const { justSolved } = this.checkSolution(newState);
        if (justSolved) {
          newState = this.markSolved(newState);
          newState = produce(newState, (draft) => {
            draft.status = PuzzleStatus.Solved;
          });
        }

        return newState;
      }

      case "DRAG_STARTED": {
        if (state.status !== PuzzleStatus.Playing) return state;
        return this.startDrag(state, event.row, event.col);
      }

      case "DRAG_CONTINUED": {
        if (state.status !== PuzzleStatus.Dragging) return state;
        return this.continueDrag(state, event.row, event.col);
      }

      case "DRAG_ENDED": {
        if (state.status !== PuzzleStatus.Dragging) return state;
        return this.endDrag(state);
      }

      case "UNDO_REQUESTED": {
        if (!this.canUndo(state)) return state;
        return this.undo(state);
      }

      case "REDO_REQUESTED": {
        if (!this.canRedo(state)) return state;
        return this.redo(state);
      }

      case "RESET_REQUESTED": {
        return this.reset(state);
      }

      case "MODE_CHANGED": {
        return this.setMode(state, event.mode);
      }

      case "TOOL_CHANGED": {
        return this.setTool(state, event.tool);
      }

      case "CLEAR_ERROR": {
        return this.clearError(state);
      }

      case "CLEAR_VICTORY": {
        return this.setShowVictory(state, false);
      }

      default:
        return state;
    }
  }

  // --- Cell Updates ---

  updateCell(
    state: PuzzleState,
    row: number,
    col: number,
    toolOverride?: CellState,
  ): PuzzleState {
    const result = cellUpdater.update({
      grid: state.grid,
      puzzle: this.context.solution,
      row,
      col,
      toolToUse: toolOverride ?? state.tool,
      mode: state.mode,
      rowHints: state.rowHints,
      columnHints: state.columnHints,
    });

    let newState = produce(state, (draft) => {
      draft.grid = result.newGrid;
      draft.rowHints = result.newRowHints;
      draft.columnHints = result.newColumnHints;
      draft.errorCell = result.errorCell;
    });

    // Add to history if not an undo/redo action
    if (!state.isUndoRedoAction) {
      newState = this.addToHistory(newState);
    }

    return produce(newState, (draft) => {
      draft.isUndoRedoAction = false;
    });
  }

  handleRightClick(state: PuzzleState, row: number, col: number): PuzzleState {
    const oppositeTool =
      state.tool === CellState.FILLED
        ? CellState.CROSSED_OUT
        : CellState.FILLED;
    return this.updateCell(state, row, col, oppositeTool);
  }

  // --- Tool & Mode ---

  setTool(state: PuzzleState, tool: CellState): PuzzleState {
    return produce(state, (draft) => {
      draft.tool = tool;
    });
  }

  setMode(state: PuzzleState, mode: GameMode): PuzzleState {
    return produce(state, (draft) => {
      draft.mode = mode;
    });
  }

  // --- Victory ---

  setShowVictory(state: PuzzleState, show: boolean): PuzzleState {
    return produce(state, (draft) => {
      if (!show && draft.status === PuzzleStatus.Solved) {
        draft.status = PuzzleStatus.Playing;
      }
    });
  }

  checkSolution(state: PuzzleState): {
    isSolved: boolean;
    justSolved: boolean;
  } {
    const isSolved = puzzleService.checkSolution(
      this.context.solution,
      state.grid,
    );
    const justSolved = isSolved && state.status !== PuzzleStatus.Solved;
    return { isSolved, justSolved };
  }

  markSolved(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.status = PuzzleStatus.Solved;
    });
  }

  // --- Error ---

  clearError(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.errorCell = null;
    });
  }

  // --- Reset ---

  reset(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.grid = puzzleService.createEmptyGameState(
        this.context.solution[0].length,
        this.context.solution.length,
      );
      draft.rowHints = puzzleService.deriveRowHints(this.context.solution);
      draft.columnHints = puzzleService.deriveColumnHints(
        this.context.solution,
      );
      draft.history = [];
      draft.historyIndex = -1;
      draft.errorCell = null;
      draft.isUndoRedoAction = false;
      draft.status = PuzzleStatus.Playing;
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
      return produce(state, (draft) => {
        draft.grid = prevEntry.grid;
        draft.rowHints = prevEntry.rowHints;
        draft.columnHints = prevEntry.columnHints;
        draft.historyIndex = state.historyIndex - 1;
        draft.isUndoRedoAction = true;
      });
    } else if (state.historyIndex === 0) {
      return produce(state, (draft) => {
        draft.grid = puzzleService.createEmptyGameState(
          this.context.solution[0].length,
          this.context.solution.length,
        );
        draft.rowHints = puzzleService.deriveRowHints(this.context.solution);
        draft.columnHints = puzzleService.deriveColumnHints(
          this.context.solution,
        );
        draft.historyIndex = -1;
        draft.isUndoRedoAction = true;
      });
    }
    return state;
  }

  redo(state: PuzzleState): PuzzleState {
    if (state.historyIndex < state.history.length - 1) {
      const nextEntry = state.history[state.historyIndex + 1];
      return produce(state, (draft) => {
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

  private hasDraggedCell(
    draggedCells: Map<number, Set<number>>,
    row: number,
    col: number,
  ): boolean {
    return draggedCells.get(row)?.has(col) ?? false;
  }

  startDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    const stateWithDrag = produce(state, (draft) => {
      draft.status = PuzzleStatus.Dragging;
      draft.dragTool = state.tool;
      draft.draggedCells = new Map([[row, new Set([col])]]);
    });

    // Update the first cell
    return this.updateCell(stateWithDrag, row, col, state.tool);
  }

  continueDrag(state: PuzzleState, row: number, col: number): PuzzleState {
    if (state.status !== PuzzleStatus.Dragging || state.dragTool === null) {
      return state;
    }

    if (this.hasDraggedCell(state.draggedCells, row, col)) {
      return state;
    }

    const stateWithDrag = produce(state, (draft) => {
      const rowSet = draft.draggedCells.get(row) ?? new Set<number>();
      rowSet.add(col);
      draft.draggedCells.set(row, rowSet);
    });

    return this.updateCell(stateWithDrag, row, col, state.dragTool);
  }

  endDrag(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.status = PuzzleStatus.Playing;
      draft.dragTool = null;
      draft.draggedCells = new Map();
    });
  }

  // --- Helpers ---

  hasContent(state: PuzzleState): boolean {
    return state.grid.some((row) =>
      row.some((cell) => cell !== CellState.EMPTY),
    );
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

    return produce(state, (draft) => {
      draft.history = [
        ...state.history.slice(0, state.historyIndex + 1),
        newEntry,
      ];
      draft.historyIndex = draft.history.length - 1;
    });
  }
}
