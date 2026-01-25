import { difficultyAnalyzer } from "./DifficultyAnalyzer";
import { CellState, PuzzleSolutionData } from "../types/nonogram";

describe("DifficultyAnalyzer", () => {
  describe("getRating", () => {
    it("should return a difficulty rating between 1 and 5", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
      ];

      const rating = difficultyAnalyzer.getRating(solution);
      
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    });

    it("should rate a simple filled grid as easy", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED],
      ];

      const rating = difficultyAnalyzer.getRating(solution);
      
      expect(rating).toBe(1);
    });

    it("should rate an empty grid as easy", () => {
      const solution: PuzzleSolutionData = [
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
      ];

      const rating = difficultyAnalyzer.getRating(solution);
      
      expect(rating).toBe(1);
    });

    it("should rate a simple alternating pattern", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
        [CellState.EMPTY, CellState.FILLED, CellState.EMPTY],
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
      ];

      const rating = difficultyAnalyzer.getRating(solution);
      
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    });
  });

  describe("analyze", () => {
    it("should return complete metrics", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.FILLED],
        [CellState.EMPTY, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.EMPTY],
        [CellState.FILLED, CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.FILLED],
        [CellState.EMPTY, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.EMPTY],
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.FILLED],
      ];

      const metrics = difficultyAnalyzer.analyze(solution);
      
      expect(metrics).toHaveProperty("difficulty");
      expect(metrics).toHaveProperty("firstPassCells");
      expect(metrics).toHaveProperty("totalCells");
      expect(metrics).toHaveProperty("firstPassPercent");
      expect(metrics).toHaveProperty("iterations");
      expect(metrics).toHaveProperty("initialForcedCells");
      expect(metrics).toHaveProperty("avgPossibilities");
    });

    it("should have totalCells equal to grid size", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
        [CellState.EMPTY, CellState.FILLED, CellState.EMPTY],
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
      ];

      const metrics = difficultyAnalyzer.analyze(solution);
      
      expect(metrics.totalCells).toBe(9);
    });

    it("should have firstPassPercent between 0 and 100", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
      ];

      const metrics = difficultyAnalyzer.analyze(solution);
      
      expect(metrics.firstPassPercent).toBeGreaterThanOrEqual(0);
      expect(metrics.firstPassPercent).toBeLessThanOrEqual(100);
    });

    it("should have at least 1 iteration", () => {
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED],
      ];

      const metrics = difficultyAnalyzer.analyze(solution);
      
      expect(metrics.iterations).toBeGreaterThanOrEqual(1);
    });
  });
});
