import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { GameMode, PuzzleStatus } from "../../types/puzzle";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { PuzzleController } from "../NonogramGrid/PuzzleController";
import ToolSelector from "../ToolSelector/ToolSelector";
import ActionButtons from "../ActionButtons/ActionButtons";
import VictoryPopup from "../VictoryPopup/VictoryPopup";
import NonogramGrid from "../NonogramGrid/NonogramGrid";
import Modal from "../Modal/Modal";
import Settings from "../Settings/Settings";
import { Icons } from "../Icons/Icons";
import { PuzzleState } from "../NonogramGrid/PuzzleState";
import "./PuzzlePlayer.css";

interface NextPuzzleInfo {
  category: string;
  id: string;
}

export interface RandomAgainParams {
  width: number;
  height: number;
  difficulty: number;
}

interface PuzzlePlayerProps {
  puzzle: PuzzleDefinition | null;
  state: PuzzleState;
  setState: React.Dispatch<React.SetStateAction<PuzzleState>>;
  controller: PuzzleController;
  nextPuzzle?: NextPuzzleInfo | null;
  randomAgainParams?: RandomAgainParams | null;
  /** When set, clicks on these cells (row,col keys) are ignored once (synthetic click after tap). */
  dragJustEndedCellsRef?: React.RefObject<Set<string> | null>;
}

export default function PuzzlePlayer({
  puzzle,
  state,
  setState,
  controller,
  nextPuzzle = null,
  randomAgainParams = null,
  dragJustEndedCellsRef,
}: PuzzlePlayerProps) {
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const key = `${String(row)},${String(col)}`;
      if (dragJustEndedCellsRef?.current?.has(key)) {
        dragJustEndedCellsRef.current.delete(key);
        if (dragJustEndedCellsRef.current.size === 0) {
          dragJustEndedCellsRef.current = null;
        }
        return;
      }
      setState((s) =>
        controller.dispatch(s, { type: "CELL_CLICKED", row, col }),
      );
    },
    [controller, setState, dragJustEndedCellsRef],
  );

  const handleRightClick = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      const oppositeTool =
        state.tool === CellState.FILLED
          ? CellState.CROSSED_OUT
          : CellState.FILLED;
      setState((s) =>
        controller.dispatch(s, {
          type: "CELL_CLICKED",
          row,
          col,
          toolOverride: oppositeTool,
        }),
      );
    },
    [controller, setState],
  );

  const handlePointerDown = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (e.button === 2) return;
      e.preventDefault(); // Prevent synthetic click (iPad Safari/Pencil fires it before our pointerup)
      setState((s) =>
        controller.dispatch(s, { type: "DRAG_STARTED", row, col }),
      );
    },
    [controller, setState],
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      setState((s) =>
        controller.dispatch(s, { type: "DRAG_CONTINUED", row, col }),
      );
    },
    [controller, setState],
  );

  const handleToolChange = useCallback(
    (tool: CellState) => {
      setState((s) => controller.dispatch(s, { type: "TOOL_CHANGED", tool }));
    },
    [controller, setState],
  );

  const handleReset = useCallback(() => {
    setState((s) => controller.dispatch(s, { type: "RESET_REQUESTED" }));
  }, [controller, setState]);

  const handleUndo = useCallback(() => {
    setState((s) => controller.dispatch(s, { type: "UNDO_REQUESTED" }));
  }, [controller, setState]);

  const handleRedo = useCallback(() => {
    setState((s) => controller.dispatch(s, { type: "REDO_REQUESTED" }));
  }, [controller, setState]);

  const handleCloseVictory = useCallback(() => {
    setState((s) => controller.dispatch(s, { type: "CLEAR_VICTORY" }));
  }, [controller, setState]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleSettingsPlayModeChange = useCallback(
    (mode: GameMode) => {
      setState((s) => controller.dispatch(s, { type: "MODE_CHANGED", mode }));
    },
    [controller, setState],
  );

  if (!puzzle) {
    return (
      <div className="puzzle-player">
        <h1>Invalid Puzzle</h1>
        <p>The puzzle data in the URL is invalid or corrupted.</p>
        <Link to="/">
          <Icons.ArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="puzzle-player">
      <div className="puzzle-player-controls">
        <ToolSelector tool={state.tool} onToolChange={handleToolChange} />
        <ActionButtons
          canUndo={controller.canUndo(state)}
          canRedo={controller.canRedo(state)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          onSettingsClick={() => {
            setSettingsOpen(true);
          }}
        />
      </div>
      <Modal
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
        }}
        title="Settings"
      >
        <Settings onPlayModeChange={handleSettingsPlayModeChange} />
      </Modal>
      <NonogramGrid
        grid={state.grid}
        rowHints={state.rowHints}
        columnHints={state.columnHints}
        onCellClick={handleCellClick}
        onCellRightClick={handleRightClick}
        onCellPointerDown={handlePointerDown}
        onCellPointerEnter={handlePointerEnter}
        errorCell={state.errorCell}
      />
      {state.status === PuzzleStatus.Solved && (
        <VictoryPopup
          onClose={handleCloseVictory}
          nextPuzzle={nextPuzzle}
          randomAgainParams={randomAgainParams}
          puzzleName={puzzle.name}
          solution={puzzle.solution}
        />
      )}
    </div>
  );
}
