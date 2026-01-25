import { useCallback } from "react";
import { Link } from "react-router-dom";
import { GameMode, PuzzleState } from "../../types/puzzle";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { PuzzleController } from "../NonogramGrid/PuzzleController";
import ModeSelector from "../ModeSelector/ModeSelector";
import ToolSelector from "../ToolSelector/ToolSelector";
import ActionButtons from "../ActionButtons/ActionButtons";
import VictoryPopup from "../VictoryPopup/VictoryPopup";
import NonogramGrid from "../NonogramGrid/NonogramGrid";
import DifficultyStars from "../DifficultyStars/DifficultyStars";
import { Icons } from "../Icons/Icons";
import "./PuzzlePlayer.css";

interface NextPuzzleInfo {
  category: string;
  id: string;
}

interface PuzzlePlayerProps {
  puzzle: PuzzleDefinition | null;
  state: PuzzleState;
  setState: React.Dispatch<React.SetStateAction<PuzzleState>>;
  controller: PuzzleController;
  nextPuzzle?: NextPuzzleInfo | null;
  showDifficulty?: boolean;
}

export default function PuzzlePlayer({
  puzzle,
  state,
  setState,
  controller,
  nextPuzzle = null,
  showDifficulty = false,
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

  const handleMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (e.button === 2) return;
      setState((s) => controller.startDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      setState((s) => controller.continueDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      setState((s) => controller.setMode(s, mode));
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
        <ModeSelector mode={state.mode} onModeChange={handleModeChange} />
        <ToolSelector tool={state.tool} onToolChange={handleToolChange} />
        <ActionButtons
          canUndo={controller.canUndo(state)}
          canRedo={controller.canRedo(state)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
        />
        {showDifficulty && puzzle.difficulty > 0 && (
          <div className="puzzle-player-difficulty">
            <DifficultyStars difficulty={puzzle.difficulty} size="medium" />
          </div>
        )}
      </div>
      <NonogramGrid
        grid={state.grid}
        rowHints={state.rowHints}
        columnHints={state.columnHints}
        onCellClick={handleCellClick}
        onCellRightClick={handleRightClick}
        onCellMouseDown={handleMouseDown}
        onCellMouseEnter={handleMouseEnter}
        errorCell={state.errorCell}
      />
      {state.showVictory && (
        <VictoryPopup
          onClose={handleCloseVictory}
          nextPuzzle={nextPuzzle}
          puzzleName={puzzle.name}
          solution={puzzle.solution}
        />
      )}
    </div>
  );
}
