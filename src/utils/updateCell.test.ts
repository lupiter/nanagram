import { updateCell, UpdateCellOptions } from './updateCell';
import { CellState as NonogramCellState, PuzzleSolutionData } from '../types/nonogram';
import { GameMode, WorkingGrid } from '../types/puzzle';

// Mock the errorSound module
jest.mock('./errorSound', () => ({
  errorSound: {
    play: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn()
  }
}));

describe('updateCell', () => {
  const createEmptyGrid = (rows: number, cols: number): WorkingGrid => 
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
    const result = updateCell(createDefaultOptions());

    expect(result.newGrid[1][1]).toBe(NonogramCellState.FILLED);
    expect(result.errorCell).toBeNull();
  });

  it('should cross out invalid cell in assisted mode', () => {
    const result = updateCell(createDefaultOptions({
      mode: GameMode.Assisted
    }));

    expect(result.newGrid[1][1]).toBe(NonogramCellState.CROSSED_OUT);
    expect(result.errorCell).toEqual([1, 1]);
  });

  it('should toggle filled cell back to empty', () => {
    const grid = createEmptyGrid(3, 3);
    grid[1][1] = NonogramCellState.FILLED;

    const result = updateCell(createDefaultOptions({
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

    const result = updateCell(createDefaultOptions({
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