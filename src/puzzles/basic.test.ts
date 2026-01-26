import { puzzleService } from '../services/Puzzle';
import { starPuzzle } from './basic';

describe('Basic Puzzles', () => {
  describe('starPuzzle', () => {
    it('is a valid puzzle definition', () => {
      expect(() => { puzzleService.validatePuzzle(starPuzzle); }).not.toThrow();
    });

    it('has a unique solution', () => {
      expect(puzzleService.checkPuzzleHasUniqueSolution(starPuzzle)).toBe(true);
    });
  });
}); 