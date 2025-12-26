import { useParams, Link } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import { GameMode } from "../types/puzzle";
import { CellState, PuzzleDefinition } from "../types/nonogram";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import { usePageTitle } from "../hooks/usePageTitle";
import { decodePuzzle } from "../utils/puzzleCodec";
import ModeSelector from "../components/ModeSelector";
import ToolSelector from "../components/ToolSelector";
import ActionButtons from "../components/ActionButtons";
import VictoryPopup from "../components/VictoryPopup";
import NonogramGrid from "../components/NonogramGrid";
import "./Puzzle.css";

export default function Play() {
  const { encoded } = useParams() as { encoded: string };

  const puzzle: PuzzleDefinition | null = useMemo(() => {
    try {
      const { name, solution } = decodePuzzle(encoded);
      return { name, solution };
    } catch {
      return null;
    }
  }, [encoded]);

  // Use a stable key for the puzzle based on the encoded string
  const puzzleKey = useMemo(() => `play-${encoded.slice(0, 16)}`, [encoded]);

  const { state, setState, controller } = usePuzzleGame({
    category: "play",
    id: puzzleKey,
    puzzle: puzzle ?? { name: "Invalid", solution: [[CellState.EMPTY]] },
  });

  const { setTitle } = usePageTitle();

  useEffect(() => {
    if (puzzle) {
      const size = `${String(puzzle.solution.length)}×${String(puzzle.solution[0].length)}`;
      document.title = `Shared Puzzle - Nanna Gram`;
      setTitle({ title: "Shared Puzzle", subtitle: size });
    } else {
      document.title = "Invalid Puzzle - Nanna Gram";
      setTitle({ title: "Invalid Puzzle" });
    }
  }, [puzzle, setTitle]);

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
      <div className="puzzle">
        <h1>Invalid Puzzle</h1>
        <p>The puzzle data in the URL is invalid or corrupted.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="puzzle">
      <div className="puzzle-controls">
        <ModeSelector mode={state.mode} onModeChange={handleModeChange} />
        <ToolSelector tool={state.tool} onToolChange={handleToolChange} />
        <ActionButtons
          canUndo={controller.canUndo(state)}
          canRedo={controller.canRedo(state)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
        />
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
          nextPuzzle={null}
          puzzleName={puzzle.name}
          solution={puzzle.solution}
        />
      )}
    </div>
  );
}

