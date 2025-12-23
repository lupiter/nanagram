import { useState, useEffect, useMemo } from "react";
import { CellState, PuzzleSolutionData } from "../types/nonogram";
import {
  deriveRowHints,
  deriveColumnHints,
  checkPuzzleHasUniqueSolution,
} from "../utils/puzzleUtils";
import NonogramGrid from "../components/NonogramGrid";
import "./Designer.css";

const AVAILABLE_SIZES = [5, 10, 15, 20] as const;

export default function Designer() {
  const [size, setSize] = useState<number>(5);
  const [grid, setGrid] = useState<PuzzleSolutionData>(() => createEmptyGrid(5));
  const [isChecking, setIsChecking] = useState(false);
  const [hasUniqueSolution, setHasUniqueSolution] = useState<boolean | null>(null);
  const [puzzleName, setPuzzleName] = useState<string>("");

  function createEmptyGrid(gridSize: number): PuzzleSolutionData {
    return Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => CellState.EMPTY)
    );
  }

  // Update grid when size changes
  useEffect(() => {
    setGrid(createEmptyGrid(size));
    setHasUniqueSolution(null);
  }, [size]);

  // Derive hints from current grid
  const rowHints: Hint[][] = useMemo(() => deriveRowHints(grid), [grid]);
  const columnHints: Hint[][] = useMemo(() => deriveColumnHints(grid), [grid]);

  // Check if puzzle has any filled cells
  const hasFilledCells = useMemo(() => 
    grid.some(row => row.some(cell => cell === CellState.FILLED)),
    [grid]
  );

  // Check solution uniqueness with debounce
  useEffect(() => {
    if (!hasFilledCells) {
      setHasUniqueSolution(null);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      const result = checkPuzzleHasUniqueSolution(grid);
      setHasUniqueSolution(result);
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [grid, hasFilledCells]);

  const handleCellClick = (row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = newGrid[row][col] === CellState.FILLED 
        ? CellState.EMPTY 
        : CellState.FILLED;
      return newGrid;
    });
  };

  const handleClear = () => {
    setGrid(createEmptyGrid(size));
    setHasUniqueSolution(null);
  };

  const handleExport = () => {
    const puzzleJson = {
      name: puzzleName.trim() || "Untitled",
      solution: grid
    };
    const jsonString = JSON.stringify(puzzleJson, null, 2);
    navigator.clipboard.writeText(jsonString).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Get status message and class
  const getStatusInfo = () => {
    if (!hasFilledCells) {
      return { message: "Draw your puzzle by clicking cells", className: "status-info" };
    }
    if (isChecking) {
      return { message: "Checking solution...", className: "status-checking" };
    }
    if (hasUniqueSolution === true) {
      return { message: "✓ Puzzle has a unique solution!", className: "status-valid" };
    }
    if (hasUniqueSolution === false) {
      return { message: "✗ Puzzle does not have a unique solution", className: "status-invalid" };
    }
    return { message: "", className: "" };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="designer">
      <h1>Puzzle Designer</h1>
      
      <div className="designer-controls">
        <div className="name-input">
          <label htmlFor="puzzle-name">Name:</label>
          <input
            type="text"
            id="puzzle-name"
            value={puzzleName}
            onChange={(e) => setPuzzleName(e.target.value)}
            placeholder="Enter puzzle name"
          />
        </div>

        <div className="size-selector">
          <label htmlFor="size-select">Size:</label>
          <select 
            id="size-select"
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {AVAILABLE_SIZES.map(s => (
              <option key={s} value={s}>{s}×{s}</option>
            ))}
          </select>
        </div>
        
        <div className="designer-actions">
          <button onClick={handleClear} className="btn-clear">
            🗑️ Clear
          </button>
          <button 
            onClick={handleExport} 
            className="btn-export"
            disabled={!hasFilledCells}
            title="Copy puzzle code to clipboard"
          >
            📋 Copy Code
          </button>
        </div>
      </div>

      <div className={`solution-status ${statusInfo.className}`}>
        {statusInfo.message}
      </div>

      <div className="designer-grid-container">
        <NonogramGrid
          grid={grid}
          rowHints={rowHints}
          columnHints={columnHints}
          onCellClick={handleCellClick}
        />
      </div>

      <div className="designer-info">
        <p>Click cells to toggle filled/unfilled. The hints update automatically.</p>
        <p>A valid puzzle must have exactly one unique solution.</p>
      </div>
    </div>
  );
}

