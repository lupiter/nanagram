import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { GameMode, PuzzleStatus, PuzzleState } from "../../types/puzzle";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { PuzzleController } from "../NonogramGrid/PuzzleController";
import ToolSelector from "../ToolSelector/ToolSelector";
import ActionButtons from "../ActionButtons/ActionButtons";
import VictoryPopup from "../VictoryPopup/VictoryPopup";
import NonogramGrid from "../NonogramGrid/NonogramGrid";
import Modal from "../Modal/Modal";
import Settings from "../Settings/Settings";
import SavedIndicator from "../SavedIndicator/SavedIndicator";
import ErrorStats from "../ErrorStats/ErrorStats";
import { errorTracker } from "../../services/ErrorTracker";
import { Icons } from "../Icons/Icons";
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
  category: string;
  id: string;
}

export default function PuzzlePlayer({
  puzzle,
  state,
  setState,
  controller,
  nextPuzzle = null,
  randomAgainParams = null,
  category,
  id,
}: PuzzlePlayerProps) {
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setState((s) =>
        controller.dispatch(s, { type: "CELL_CLICKED", row, col }),
      );
    },
    [controller, setState],
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
      <ErrorStats
        errors={errorTracker.detectErrors(
          state.grid,
          state.rowHints as any,
          state.columnHints as any,
          puzzle.solution,
        )}
      />
      <NonogramGrid
        grid={state.grid}
        rowHints={state.rowHints}
        columnHints={state.columnHints}
        onCellClick={handleCellClick}
        onCellRightClick={handleRightClick}
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
      <SavedIndicator category={category} id={id} />
    </div>
  );
}
