import { produce } from "immer";
import {
  GameMode,
  PuzzleContext,
  PuzzleEvent,
  PuzzleStatus,
  HistoryEntry,
  PuzzleState,
} from "../../types/puzzle";
import { GameState, CellState } from "../../types/nonogram";
import { puzzleService } from "../../services/Puzzle";
import { cellUpdater } from "../../services/CellUpdater";
import { createInitialState } from "./PuzzleState";

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

        const { isSolved } = this.checkSolution(newState);
        if (isSolved) {
          newState = this.markSolved(newState);
          newState = produce(newState, (draft) => {
            draft.status = PuzzleStatus.Solved;
          });
        }

        return newState;
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

  private updateCell(
    state: PuzzleState,
    row: number,
    col: number,
    toolOverride?: CellState,
  ): PuzzleState {
    const result = cellUpdater.update({
      grid: state.grid,
      solution: this.context.solution,
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

  // --- Tool & Mode ---

  private setTool(state: PuzzleState, tool: CellState): PuzzleState {
    return produce(state, (draft) => {
      draft.tool = tool;
    });
  }

  private setMode(state: PuzzleState, mode: GameMode): PuzzleState {
    return produce(state, (draft) => {
      draft.mode = mode;
    });
  }

  // --- Victory ---

  private setShowVictory(state: PuzzleState, show: boolean): PuzzleState {
    return produce(state, (draft) => {
      if (!show && draft.status === PuzzleStatus.Solved) {
        draft.status = PuzzleStatus.Playing;
      }
    });
  }

  private checkSolution(state: PuzzleState): {
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

  private markSolved(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.status = PuzzleStatus.Solved;
    });
  }

  // --- Error ---

  private clearError(state: PuzzleState): PuzzleState {
    return produce(state, (draft) => {
      draft.errorCell = null;
    });
  }

  // --- Reset ---

  private reset(state: PuzzleState): PuzzleState {
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

  private undo(state: PuzzleState): PuzzleState {
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

  private redo(state: PuzzleState): PuzzleState {
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
