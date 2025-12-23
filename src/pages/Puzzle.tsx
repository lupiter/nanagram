import { useParams, Link } from "react-router-dom";
import { 
  getNextPuzzle, 
  getPreviousPuzzle,
  markPuzzleCompleted,
  saveProgress,
  loadProgress,
  clearProgress,
  puzzleDefinition
} from "../utils/puzzleLoader";
import { useState, useEffect, useRef } from "react";
import { WorkingGrid, GameMode } from "../types/puzzle";
import { CellState as NonogramCellState, Hint } from "../types/nonogram";
import {
  deriveRowHints,
  deriveColumnHints,
  checkSolution,
  createEmptyGameState,
} from "../utils/puzzleUtils";
import { errorSound } from "../utils/errorSound";
import { updateCell } from "../utils/updateCell";
import ToggleGroup from "../components/ToggleGroup";
import VictoryPopup from "../components/VictoryPopup";
import NonogramGrid from "../components/NonogramGrid";
import "./Puzzle.css";

interface HistoryState {
  grid: WorkingGrid;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

export default function Puzzle() {
  const { category, id } = useParams() as { category: string, id: string };
  const puzzle = puzzleDefinition(category, id);
  const puzzleName = puzzle.name;

  const [grid, setGrid] = useState<WorkingGrid>(createEmptyGameState(puzzle.solution[0].length, puzzle.solution.length));
  const [tool, setTool] = useState<NonogramCellState>(NonogramCellState.FILLED);
  const [mode, setMode] = useState<GameMode>(() => {
    const savedMode = localStorage.getItem('gameMode');
    return savedMode ? (savedMode as GameMode) : GameMode.Assisted;
  });
  const [isSolved, setIsSolved] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [errorCell, setErrorCell] = useState<[number, number] | null>(null);
  const [rowHints, setRowHints] = useState<Hint[][]>([]);
  const [columnHints, setColumnHints] = useState<Hint[][]>([]);
  
  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTool, setDragTool] = useState<NonogramCellState | null>(null);
  const draggedCells = useRef<Set<string>>(new Set());

  // Navigation
  const nextPuzzle = getNextPuzzle(category, id);
  const prevPuzzle = getPreviousPuzzle(category, id);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      void errorSound.cleanup();
    };
  }, []);

  // Reset state when puzzle changes
  useEffect(() => {
    const saved = loadProgress(category, id);
    if (saved) {
      setGrid(saved as WorkingGrid);
    } else {
      setGrid(createEmptyGameState(puzzle.solution[0].length, puzzle.solution.length));
    }
    setRowHints(deriveRowHints(puzzle.solution));
    setColumnHints(deriveColumnHints(puzzle.solution));
    setIsSolved(false);
    setShowVictory(false);
    setHistory([]);
    setHistoryIndex(-1);
  }, [category, id, puzzle]);

  // Initialize hints when puzzle loads
  useEffect(() => {
    setRowHints(deriveRowHints(puzzle.solution));
    setColumnHints(deriveColumnHints(puzzle.solution));
  }, [puzzle]);

  // Check solution and save progress
  useEffect(() => {
    const solved = checkSolution(puzzle.solution, grid);
    if (solved && !isSolved) {
      setIsSolved(true);
      setShowVictory(true);
      markPuzzleCompleted(category, id);
      clearProgress(category, id);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (!solved) {
      // Save progress for non-empty grids
      const hasContent = grid.some(row => row.some(cell => cell !== NonogramCellState.EMPTY));
      if (hasContent) {
        saveProgress(category, id, grid);
      }
    }
  }, [grid, puzzle, category, id, isSolved]);

  // Add to history when grid changes (but not during undo/redo)
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    const newState: HistoryState = {
      grid: grid.map(row => [...row]),
      rowHints: rowHints.map(hints => hints.map(h => ({ ...h }))),
      columnHints: columnHints.map(hints => hints.map(h => ({ ...h })))
    };
    
    // Only add to history if there's actual content
    const hasContent = grid.some(row => row.some(cell => cell !== NonogramCellState.EMPTY));
    if (hasContent) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [grid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset error state after animation completes
  useEffect(() => {
    if (errorCell) {
      const timer = setTimeout(() => { setErrorCell(null); }, 200);
      return () => { clearTimeout(timer); };
    }
  }, [errorCell]);

  const handleCellChange = async (row: number, col: number, toolOverride?: NonogramCellState) => {
    const result = await updateCell({
      grid,
      puzzle: puzzle.solution,
      row,
      col,
      toolToUse: toolOverride ?? tool,
      mode,
      rowHints,
      columnHints
    });

    setGrid(result.newGrid);
    setRowHints(result.newRowHints);
    setColumnHints(result.newColumnHints);
    setErrorCell(result.errorCell);
  };

  const handleRightClick = async (
    row: number,
    col: number,
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    event.preventDefault();
    const oppositeTool =
      tool === NonogramCellState.FILLED
        ? NonogramCellState.CROSSED_OUT
        : NonogramCellState.FILLED;
    
    const result = await updateCell({
      grid,
      puzzle: puzzle.solution,
      row,
      col,
      toolToUse: oppositeTool,
      mode,
      rowHints,
      columnHints
    });

    setGrid(result.newGrid);
    setRowHints(result.newRowHints);
    setColumnHints(result.newColumnHints);
    setErrorCell(result.errorCell);
  };

  // Drag handlers
  const handleMouseDown = (row: number, col: number, event: React.MouseEvent<Element, MouseEvent>) => {
    if (event.button === 2) return; // Ignore right-click for drag
    setIsDragging(true);
    setDragTool(tool);
    draggedCells.current = new Set([`${row}-${col}`]);
  };

  const handleMouseEnter = async (row: number, col: number) => {
    if (!isDragging || dragTool === null) return;
    
    const cellKey = `${row}-${col}`;
    if (draggedCells.current.has(cellKey)) return;
    
    draggedCells.current.add(cellKey);
    await handleCellChange(row, col, dragTool);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTool(null);
    draggedCells.current = new Set();
  };

  // Add global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    localStorage.setItem('gameMode', newMode);
  };

  const handleReset = () => {
    setGrid(createEmptyGameState(puzzle.solution[0].length, puzzle.solution.length));
    setRowHints(deriveRowHints(puzzle.solution));
    setColumnHints(deriveColumnHints(puzzle.solution));
    setIsSolved(false);
    setShowVictory(false);
    setElapsedTime(0);
    setHistory([]);
    setHistoryIndex(-1);
    clearProgress(category, id);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevState = history[historyIndex - 1];
      setGrid(prevState.grid.map(row => [...row]));
      setRowHints(prevState.rowHints.map(hints => hints.map(h => ({ ...h }))));
      setColumnHints(prevState.columnHints.map(hints => hints.map(h => ({ ...h }))));
      setHistoryIndex(prev => prev - 1);
    } else if (historyIndex === 0) {
      // Undo to empty state
      isUndoRedoAction.current = true;
      setGrid(createEmptyGameState(puzzle.solution[0].length, puzzle.solution.length));
      setRowHints(deriveRowHints(puzzle.solution));
      setColumnHints(deriveColumnHints(puzzle.solution));
      setHistoryIndex(-1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setGrid(nextState.grid.map(row => [...row]));
      setRowHints(nextState.rowHints.map(hints => hints.map(h => ({ ...h }))));
      setColumnHints(nextState.columnHints.map(hints => hints.map(h => ({ ...h }))));
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="puzzle-header">
        <div className="puzzle-nav">
          {prevPuzzle ? (
            <Link to={`/puzzle/${prevPuzzle.category}/${prevPuzzle.id}`} className="nav-button" aria-label="Previous puzzle">
              ← Prev
            </Link>
          ) : (
            <span className="nav-button disabled">← Prev</span>
          )}
          <h2>Puzzle {id} <span className="category-label">({category})</span></h2>
          {nextPuzzle ? (
            <Link to={`/puzzle/${nextPuzzle.category}/${nextPuzzle.id}`} className="nav-button" aria-label="Next puzzle">
              Next →
            </Link>
          ) : (
            <span className="nav-button disabled">Next →</span>
          )}
        </div>
        <div className="timer" aria-label="Elapsed time">
          ⏱️ {formatTime(elapsedTime)}
        </div>
      </div>
      <div className="puzzle">
        <div className="controls">
          <ToggleGroup
            value={mode}
            onChange={(newMode) => {
              handleModeChange(newMode);
            }}
            options={[
              { value: GameMode.Free, label: "Free" },
              { value: GameMode.Assisted, label: "Assisted" },
            ]}
            name="mode"
            title="Game Mode"
          />
        </div>
        <NonogramGrid
          grid={grid}
          rowHints={rowHints}
          columnHints={columnHints}
          onCellClick={(row, col) => {
            handleCellChange(row, col).catch((error: unknown) => {
              console.error('Error updating cell:', error);
            });
          }}
          onCellRightClick={(row, col, e) => {
            handleRightClick(row, col, e).catch((error: unknown) => {
              console.error('Error handling right click:', error);
            });
          }}
          onCellMouseDown={handleMouseDown}
          onCellMouseEnter={(row, col) => {
            handleMouseEnter(row, col).catch((error: unknown) => {
              console.error('Error during drag:', error);
            });
          }}
          errorCell={errorCell}
        />
        <div className="controls">
          <ToggleGroup
            value={tool}
            onChange={setTool}
            options={[
              {
                value: NonogramCellState.FILLED,
                label: "■",
                ariaLabel: "Fill",
              },
              {
                value: NonogramCellState.CROSSED_OUT,
                label: "✕",
                ariaLabel: "Cross",
              },
            ]}
            name="tool"
            title="Tool"
          />
        </div>
        <div className="action-buttons">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex < 0}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↪ Redo
          </button>
          <button onClick={handleReset} aria-label="Reset puzzle">
            🔄 Reset
          </button>
        </div>
        {showVictory && (
          <VictoryPopup 
            onClose={() => setShowVictory(false)} 
            nextPuzzle={nextPuzzle}
            puzzleName={puzzleName}
          />
        )}
      </div>
    </>
  );
}
