import { useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { getNextPuzzle, getPreviousPuzzle, puzzleDefinition } from "../utils/puzzleLoader";
import { GameMode } from "../types/puzzle";
import { CellState } from "../types/nonogram";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import PuzzleHeader from "../components/PuzzleHeader";
import ModeSelector from "../components/ModeSelector";
import ToolSelector from "../components/ToolSelector";
import ActionButtons from "../components/ActionButtons";
import VictoryPopup from "../components/VictoryPopup";
import NonogramGrid from "../components/NonogramGrid";
import "./Puzzle.css";

export default function Puzzle() {
  const { category, id } = useParams() as { category: string; id: string };
  const puzzle = puzzleDefinition(category, id);
  const { state, setState, controller } = usePuzzleGame({ category, id, puzzle });

  const nextPuzzle = getNextPuzzle(category, id);
  const prevPuzzle = getPreviousPuzzle(category, id);

  useEffect(() => {
    document.title = `${category} #${id} - Nanna Gram`;
  }, [category, id]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Skip if already handled by drag start
      setState(s => {
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
      setState(s => controller.handleRightClick(s, row, col));
    },
    [controller, setState]
  );

  const handleMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (e.button === 2) return;
      setState(s => controller.startDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      setState(s => controller.continueDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      setState(s => controller.setMode(s, mode));
    },
    [controller, setState]
  );

  const handleToolChange = useCallback(
    (tool: CellState) => {
      setState(s => controller.setTool(s, tool));
    },
    [controller, setState]
  );

  const handleReset = useCallback(() => {
    setState(s => controller.reset(s));
  }, [controller, setState]);

  const handleUndo = useCallback(() => {
    setState(s => controller.undo(s));
  }, [controller, setState]);

  const handleRedo = useCallback(() => {
    setState(s => controller.redo(s));
  }, [controller, setState]);

  const handleCloseVictory = useCallback(() => {
    setState(s => controller.setShowVictory(s, false));
  }, [controller, setState]);

  return (
    <>
      <PuzzleHeader
        category={category}
        id={id}
        prevPuzzle={prevPuzzle}
        nextPuzzle={nextPuzzle}
      />
      <div className="puzzle">
        <ModeSelector mode={state.mode} onModeChange={handleModeChange} />
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
        <ToolSelector tool={state.tool} onToolChange={handleToolChange} />
        <ActionButtons
          canUndo={controller.canUndo(state)}
          canRedo={controller.canRedo(state)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
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
    </>
  );
}
