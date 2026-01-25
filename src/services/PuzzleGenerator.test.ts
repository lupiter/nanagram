import { puzzleGenerator } from "./PuzzleGenerator";
import { CellState } from "../types/nonogram";

describe("PuzzleGenerator", () => {
  describe("generate", () => {
    it("should generate a puzzle with the specified dimensions", () => {
      const height = 5;
      const width = 5;

      const puzzle = puzzleGenerator.generate(height, 1, 100, width);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.solution.length).toBe(height);
      expect(puzzle?.solution[0].length).toBe(width);
    });

    it("should generate a puzzle with valid cell values", () => {
      const puzzle = puzzleGenerator.generate(5, 1, 100);

      expect(puzzle).not.toBeNull();
      if (puzzle) {
        for (const row of puzzle.solution) {
          for (const cell of row) {
            expect([CellState.EMPTY, CellState.FILLED]).toContain(cell);
          }
        }
      }
    });

    it("should generate a puzzle with a difficulty rating", () => {
      const puzzle = puzzleGenerator.generate(5, 1, 100);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.difficulty).toBeGreaterThanOrEqual(1);
      expect(puzzle?.difficulty).toBeLessThanOrEqual(5);
    });

    it("should generate different puzzles on consecutive calls", () => {
      const puzzle1 = puzzleGenerator.generate(5, 1, 100);
      const puzzle2 = puzzleGenerator.generate(5, 1, 100);

      expect(puzzle1).not.toBeNull();
      expect(puzzle2).not.toBeNull();

      // Convert to string for comparison
      const str1 = JSON.stringify(puzzle1?.solution);
      const str2 = JSON.stringify(puzzle2?.solution);

      // They might be the same by chance, but very unlikely for 25 cells
      expect(str1 === str2).toBe(false);
    });

    it("should handle rectangular puzzles (10x15)", () => {
      const height = 10;
      const width = 15;

      const puzzle = puzzleGenerator.generate(height, 1, 100, width);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.solution.length).toBe(height);
      expect(puzzle?.solution[0].length).toBe(width);
    });

    it("should generate puzzles with some filled cells", () => {
      const puzzle = puzzleGenerator.generate(5, 1, 100);

      expect(puzzle).not.toBeNull();
      const filledCount = puzzle?.solution
        .flat()
        .filter((cell: number) => cell === (CellState.FILLED as number)).length ?? 0;

      // With 40-60% fill probability, we should have some filled cells
      expect(filledCount).toBeGreaterThan(0);
    });

    it("should respect minimum difficulty", () => {
      // Try to generate a puzzle with minimum difficulty 2
      const puzzle = puzzleGenerator.generate(5, 2, 500);

      // Might return null if no puzzle meets criteria, which is valid
      if (puzzle) {
        expect(puzzle.difficulty).toBeGreaterThanOrEqual(2);
      }
    });

    it("should return null if no valid puzzle found within attempts", () => {
      // Use impossibly high difficulty to force failure
      const puzzle = puzzleGenerator.generate(5, 100, 10);

      expect(puzzle).toBeNull();
    });
  });

  describe("generateAsync", () => {
    it("should generate a valid puzzle asynchronously", async () => {
      const height = 5;
      const width = 5;

      const puzzle = await puzzleGenerator.generateAsync(height, 1, 100, undefined, width);

      expect(puzzle).not.toBeNull();
      expect(puzzle?.solution.length).toBe(height);
      expect(puzzle?.solution[0].length).toBe(width);
      expect(puzzle?.difficulty).toBeGreaterThanOrEqual(1);
      expect(puzzle?.difficulty).toBeLessThanOrEqual(5);
    });

    it("should generate a puzzle within reasonable time", async () => {
      const start = Date.now();

      await puzzleGenerator.generateAsync(5, 1, 100);

      const elapsed = Date.now() - start;
      // Should complete within 5 seconds even with unique solution validation
      expect(elapsed).toBeLessThan(5000);
    });

    it("should call progress callback", async () => {
      const progressCalls: number[] = [];
      const onProgress = (attempt: number) => { progressCalls.push(attempt); };

      await puzzleGenerator.generateAsync(5, 1, 50, onProgress);

      // Progress should be called at least once (at attempt 0)
      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[0]).toBe(0);
    });
  });
});
