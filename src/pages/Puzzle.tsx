import { useParams, Link } from "react-router-dom";
import { 
  puzzle as loadPuzzle, 
  getNextPuzzle, 
  getPreviousPuzzle,
  markPuzzleCompleted,
  saveProgress,
  loadProgress,
  clearProgress
} from "../utils/puzzleLoader";
import { useState, useEffect, useRef, useCallback } from "react";
import { WorkingGrid, GameMode } from "../types/puzzle";
import { CellState as NonogramCellState, Hint } from "../types/nonogram";
import {
  deriveRowHints,
  deriveColumnHints,
  checkSolution,
} from "../utils/puzzleUtils";
import { errorSound } from "../utils/errorSound";
import { updateCell } from "../utils/updateCell";
import ToggleGroup from "../components/ToggleGroup";
import VictoryPopup from "../components/VictoryPopup";
import HintDisplay from "../components/HintDisplay";
import "./Puzzle.css";

interface HistoryState {
  grid: WorkingGrid;
  rowHints: Hint[][];
  columnHints: Hint[][];
}

export default function Puzzle() {
  const { category, id } = useParams() as { category: string, id: string };
  const puzzle = loadPuzzle(category, id);

  const createEmptyGrid = useCallback(() => 
    puzzle.map((row) => row.map(() => NonogramCellState.EMPTY)),
    [puzzle]
  );

  const [grid, setGrid] = useState<WorkingGrid>(() => {
    const saved = loadProgress(category, id);
    if (saved) {
      return saved as WorkingGrid;
    }
    return createEmptyGrid();
  });
  const [tool, setTool] = useState<NonogramCellState>(NonogramCellState.FILLED);
  const [mode, setMode] = useState<GameMode>(() => {
    const savedMode = localStorage.getItem('gameMode');
    return savedMode ? (savedMode as GameMode) : GameMode.Assisted;
  });
  const [isSolved, setIsSolved] = useState(false);
  const [errorCell, setErrorCell] = useState<[number, number] | null>(null);
  const [rowHints, setRowHints] = useState<Hint[][]>([]);
  const [columnHints, setColumnHints] = useState<Hint[][]>([]);
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
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

  // Start timer
  useEffect(() => {
    if (!isSolved) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSolved]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
      setGrid(createEmptyGrid());
    }
    setRowHints(deriveRowHints(puzzle));
    setColumnHints(deriveColumnHints(puzzle));
    setIsSolved(false);
    setElapsedTime(0);
    setHistory([]);
    setHistoryIndex(-1);
  }, [category, id, puzzle, createEmptyGrid]);

  // Initialize hints when puzzle loads
  useEffect(() => {
    setRowHints(deriveRowHints(puzzle));
    setColumnHints(deriveColumnHints(puzzle));
  }, [puzzle]);

  // Check solution and save progress
  useEffect(() => {
    const solved = checkSolution(puzzle, grid);
    if (solved && !isSolved) {
      setIsSolved(true);
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
      puzzle,
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
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const oppositeTool =
      tool === NonogramCellState.FILLED
        ? NonogramCellState.CROSSED_OUT
        : NonogramCellState.FILLED;
    
    const result = await updateCell({
      grid,
      puzzle,
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
  const handleMouseDown = (row: number, col: number, event: React.MouseEvent<HTMLInputElement>) => {
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
    setGrid(createEmptyGrid());
    setRowHints(deriveRowHints(puzzle));
    setColumnHints(deriveColumnHints(puzzle));
    setIsSolved(false);
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
      setGrid(createEmptyGrid());
      setRowHints(deriveRowHints(puzzle));
      setColumnHints(deriveColumnHints(puzzle));
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
        <table className="puzzle-grid" role="grid">
          <thead>
            <tr>
              <th></th>
              {columnHints.map((hints, colIndex) => (
                <th key={colIndex} role="columnheader">
                  <HintDisplay hints={hints} isVertical={true} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={rowIndex} role="row">
                <th role="rowheader">
                  <HintDisplay hints={rowHints[rowIndex]} isVertical={false} />
                </th>
                {row.map((cell, colIndex) => (
                  <td key={`${String(rowIndex)}-${String(colIndex)}`} role="gridcell">
                    <input
                      type="checkbox"
                      id={`cell-${String(rowIndex)}-${String(colIndex)}`}
                      checked={cell === NonogramCellState.FILLED}
                      onChange={() => {
                        handleCellChange(rowIndex, colIndex).catch((error: unknown) => {
                          console.error('Error updating cell:', error);
                        });
                      }}
                      onContextMenu={(e) => {
                        handleRightClick(rowIndex, colIndex, e).catch((error: unknown) => {
                          console.error('Error handling right click:', error);
                        });
                      }}
                      onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                      onMouseEnter={() => {
                        handleMouseEnter(rowIndex, colIndex).catch((error: unknown) => {
                          console.error('Error during drag:', error);
                        });
                      }}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate =
                            cell === NonogramCellState.EMPTY;
                        }
                      }}
                      className={
                        errorCell &&
                        errorCell[0] === rowIndex &&
                        errorCell[1] === colIndex
                          ? "shake"
                          : ""
                      }
                      aria-label={`Cell at row ${String(rowIndex + 1)}, column ${String(colIndex + 1)}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
        {isSolved && (
          <VictoryPopup 
            onClose={() => setIsSolved(false)} 
            nextPuzzle={nextPuzzle}
          />
        )}
      </div>
    </>
  );
}
