import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { GameMode, PuzzleState } from "../../types/puzzle";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { PuzzleController } from "../NonogramGrid/PuzzleController";
import ToolSelector from "../ToolSelector/ToolSelector";
import ActionButtons from "../ActionButtons/ActionButtons";
import VictoryPopup from "../VictoryPopup/VictoryPopup";
import NonogramGrid from "../NonogramGrid/NonogramGrid";
import Modal from "../Modal/Modal";
import Settings from "../Settings/Settings";
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
}

export default function PuzzlePlayer({
  puzzle,
  state,
  setState,
  controller,
  nextPuzzle = null,
  randomAgainParams = null,
}: PuzzlePlayerProps) {
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setState((s) => {
        if (s.isDragging && (s.draggedCells.get(row)?.has(col) ?? false)) {
          return s;
        }
        return controller.updateCell(s, row, col);
      });
    },
    [controller, setState]
  );

  const handleRightClick = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      setState((s) => controller.handleRightClick(s, row, col));
    },
    [controller, setState]
  );

  const handlePointerDown = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (e.button === 2) return;
      setState((s) => controller.startDrag(s, row, col));
    },
    [controller, setState]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      setState((s) => controller.continueDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleToolChange = useCallback(
    (tool: CellState) => {
      setState((s) => controller.setTool(s, tool));
    },
    [controller, setState]
  );

  const handleReset = useCallback(() => {
    setState((s) => controller.reset(s));
  }, [controller, setState]);

  const handleUndo = useCallback(() => {
    setState((s) => controller.undo(s));
  }, [controller, setState]);

  const handleRedo = useCallback(() => {
    setState((s) => controller.redo(s));
  }, [controller, setState]);

  const handleCloseVictory = useCallback(() => {
    setState((s) => controller.setShowVictory(s, false));
  }, [controller, setState]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleSettingsPlayModeChange = useCallback(
    (mode: GameMode) => {
      setState((s) => controller.setMode(s, mode));
    },
    [controller, setState]
  );

  if (!puzzle) {
    return (
      <div className="puzzle-player">
        <h1>Invalid Puzzle</h1>
        <p>The puzzle data in the URL is invalid or corrupted.</p>
        <Link to="/"><Icons.ArrowLeft /> Back to Home</Link>
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
          onSettingsClick={() => setSettingsOpen(true)}
        />
      </div>
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
      {state.showVictory && (
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
