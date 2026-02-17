import { cellUpdater } from '../services/CellUpdater';
import { UpdateCellOptions } from '../types/puzzle';
import { CellState as NonogramCellState, PuzzleSolutionData } from '../types/nonogram';
import { GameMode } from '../types/puzzle';
import { GameState } from '../types/nonogram';

// Mock the errorSound module
jest.mock('../services/ErrorSound', () => ({
  errorSound: {
    play: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn()
  }
}));

describe('updateCell', () => {
  const createEmptyGrid = (rows: number, cols: number): GameState => 
    Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => NonogramCellState.EMPTY)
    );

  const createEmptyHints = (size: number) => 
    Array.from({ length: size }, () => []);

  const createSolutionGrid = (rows: number, cols: number): PuzzleSolutionData => 
    Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => NonogramCellState.EMPTY)
    );

  const createDefaultOptions = (overrides: Partial<UpdateCellOptions> = {}): UpdateCellOptions => ({
    grid: createEmptyGrid(3, 3),
    puzzle: createSolutionGrid(3, 3),
    row: 1,
    col: 1,
    toolToUse: NonogramCellState.FILLED,
    mode: GameMode.Free,
    rowHints: createEmptyHints(3),
    columnHints: createEmptyHints(3),
    ...overrides
  });

  it('should fill an empty cell in free mode', () => {
    const result = cellUpdater.update(createDefaultOptions());

    expect(result.newGrid[1][1]).toBe(NonogramCellState.FILLED);
    expect(result.errorCell).toBeNull();
  });

  it('should cross out invalid cell in assisted mode', () => {
    const result = cellUpdater.update(createDefaultOptions({
      mode: GameMode.Assisted
    }));

    expect(result.newGrid[1][1]).toBe(NonogramCellState.CROSSED_OUT);
    expect(result.errorCell).toEqual([1, 1]);
  });

  it('should cross out invalid cell in correction mode (fix wrong fill only)', () => {
    const result = cellUpdater.update(createDefaultOptions({
      mode: GameMode.Correction
    }));

    expect(result.newGrid[1][1]).toBe(NonogramCellState.CROSSED_OUT);
    expect(result.errorCell).toEqual([1, 1]);
  });

  it('should not auto-cross remaining cells in completed row in correction mode', () => {
    const puzzle = createSolutionGrid(3, 3);
    puzzle[1] = Array.from({ length: 3 }, () => NonogramCellState.FILLED);
    const grid = createEmptyGrid(3, 3);
    grid[1][0] = NonogramCellState.FILLED;
    grid[1][1] = NonogramCellState.FILLED;

    const result = cellUpdater.update(createDefaultOptions({
      grid,
      puzzle,
      row: 1,
      col: 2,
      mode: GameMode.Correction
    }));

    expect(result.newGrid[1][2]).toBe(NonogramCellState.FILLED);
    expect(result.newGrid[1].filter(c => c === NonogramCellState.EMPTY).length).toBe(0);
    expect(result.newGrid.flat().filter(c => c === NonogramCellState.CROSSED_OUT).length).toBe(0);
  });

  it('should toggle filled cell back to empty', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = NonogramCellState.FILLED;

    const result = cellUpdater.update(createDefaultOptions({
      grid
    }));

    expect(result.newGrid[1][1]).toBe(NonogramCellState.EMPTY);
    expect(result.errorCell).toBeNull();
  });

  it('should auto-cross out remaining cells in completed row', () => {
    // Create a puzzle where middle row should be all filled
    const puzzle = createSolutionGrid(3, 3);
    puzzle[1] = Array.from({ length: 3 }, () => NonogramCellState.FILLED);
    
    // Create a grid where we're about to fill the last cell in middle row
    const grid = createEmptyGrid(3, 3);
    grid[1][0] = NonogramCellState.FILLED;
    grid[1][1] = NonogramCellState.FILLED;

    const result = cellUpdater.update(createDefaultOptions({
      grid,
      puzzle,
      row: 1,
      col: 2,
      mode: GameMode.Assisted
    }));

    // The last cell should be filled and no cells should be empty in that row
    expect(result.newGrid[1]).not.toContain(NonogramCellState.EMPTY);
    expect(result.errorCell).toBeNull();
  });
}); 