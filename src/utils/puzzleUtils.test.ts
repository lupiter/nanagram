import { GameState, PuzzleSolutionData, SolutionCell } from '../types/nonogram';
import { createEmptyGameState, validatePuzzle, checkSolution, deriveRowHints, deriveColumnHints, checkPuzzleHasUniqueSolution, generatePossibleDataForHints } from './puzzleUtils';

describe('Puzzle Utilities', () => {
  describe('createEmptyGameState', () => {
    it('should create an empty game state with correct dimensions', () => {
      const width = 3;
      const height = 2;
      const gameState = createEmptyGameState(width, height);

      expect(gameState.length).toBe(height);
      expect(gameState[0].length).toBe(width);
      expect(gameState[1].length).toBe(width);

      // Check that all cells are empty
      for (let y = 0; y < height; y++) {
        expect(gameState[y].length).toBe(width);
        for (let x = 0; x < width; x++) {
          expect(gameState[y][x]).toBe(0);
        }
      }
    });
  });

  describe('deriveHints', () => {
    const solution: SolutionCell[][] = [
      [1, 1, 1],   // First row: 3
      [0, 0, 0],   // Second row: empty
      [1, 1, 1],   // Third row: 3
    ];

    it('derives correct row hints', () => {
      const rowHints = deriveRowHints(solution);
      expect(rowHints).toEqual([
        [{ hint: 3, used: false }],  // First row
        [],   // Second row (empty)
        [{ hint: 3, used: false }],  // Third row
      ]);
    });

    it('derives correct column hints', () => {
      const columnHints = deriveColumnHints(solution);
      expect(columnHints).toEqual([
        [{ hint: 1, used: false }, { hint: 1, used: false }],  // First column
        [{ hint: 1, used: false }, { hint: 1, used: false }],  // Second column
        [{ hint: 1, used: false }, { hint: 1, used: false }],  // Third column
      ]);
    });
  });

  describe('validatePuzzle', () => {
    it('should validate a valid puzzle', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 1, 0],
        [1, 0, 1],
      ];
      expect(validatePuzzle(puzzle)).toBe(true);
    });

    it('should reject invalid dimensions', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 1, 0],
        [1, 0],
      ];
      expect(validatePuzzle(puzzle)).toBe(false);
    });
  });

  describe('checkSolution', () => {
    it('should correctly check a matching solution', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 1, 0],
        [1, 0, 1],
      ];
      const gameState: GameState = [
        [0, 1, 0],
        [1, 0, 1],
      ];

      expect(checkSolution(puzzle, gameState)).toBe(true);
    });

    it('should not worry about the difference between empty and crossed out', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 1, 0],
        [1, 0, 1],
      ];
      const gameState: GameState = [
        [2, 1, 0],
        [1, 2, 1],
      ];

      expect(checkSolution(puzzle, gameState)).toBe(true);
    });

    it('should regard an empty solution as invalid', () => {
      const puzzle: PuzzleSolutionData = [
        [1, 0, 1],
        [0, 1, 0],
      ];
      const gameState: GameState = [
        [0, 0, 0],
        [0, 0, 0],
      ];

      expect(checkSolution(puzzle, gameState)).toBe(false);
    });

    it('should correctly check a non-matching solution', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 1, 0],
        [1, 0, 1],
      ];
      const gameState: GameState = [
        [1, 0, 0],
        [1, 0, 1],
      ];

      expect(checkSolution(puzzle, gameState)).toBe(false);
    });
  });

  describe('generatePossibleDataForHints', () => {
    it('should generate possible data for hints: 1 and 1', () => {
      const hints = [{ hint: 1, used: false }, { hint: 1, used: false }];
      const size = 3;
      const possibleData = generatePossibleDataForHints(hints, size);
      expect(possibleData).toEqual([
        [1, 0, 1],
      ]);
    });

    it('should generate possible data for hints: all filled', () => {
      const hints = [{ hint: 3, used: false }];
      const size = 3;
      const possibleData = generatePossibleDataForHints(hints, size);
      expect(possibleData).toEqual([
        [1, 1, 1],
      ]);
    });

    it('should generate no solutions for hints: 1 and 2', () => {
      const hints = [{ hint: 1, used: false }, { hint: 2, used: false }];
      const size = 3;
      const possibleData = generatePossibleDataForHints(hints, size);
      expect(possibleData).toEqual([]);
    });

    it('should generate various solutions for hint: 1', () => {
      const hints = [{ hint: 1, used: false }];
      const size = 3;
      const possibleData = generatePossibleDataForHints(hints, size);
      expect(possibleData).toEqual([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]);
    });
  });

  describe('checkPuzzleHasUniqueSolution', () => {
    it('should identify a simple solvable puzzle', () => {
      const puzzle: PuzzleSolutionData = [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0]
      ];
      expect(checkPuzzleHasUniqueSolution(puzzle)).toBe(true);
    });

    it('should identify an unsolvable puzzle with multiple solutions', () => {
      const puzzle: PuzzleSolutionData = [
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
      ];
      expect(checkPuzzleHasUniqueSolution(puzzle)).toBe(false);
    });

    it('should handle empty puzzle', () => {
      const puzzle: PuzzleSolutionData = [
        [0, 0],
        [0, 0]
      ];
      expect(checkPuzzleHasUniqueSolution(puzzle)).toBe(true);
    });

    it('should handle single-cell puzzle', () => {
      const puzzle: PuzzleSolutionData = [[1]];
      expect(checkPuzzleHasUniqueSolution(puzzle)).toBe(true);
    });

    it('should handle a puzzle with unique solution but requiring multiple steps', () => {
      const puzzle: PuzzleSolutionData = [
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1]
      ];
      expect(checkPuzzleHasUniqueSolution(puzzle)).toBe(true);
    });
  });
}); 