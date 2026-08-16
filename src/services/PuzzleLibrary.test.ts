import { describe, it, expect, afterEach } from "@jest/globals";
import { PuzzleLibrary } from "./PuzzleLibrary";

describe("PuzzleLibrary - Version Tracking", () => {
  let puzzleLibrary: PuzzleLibrary;
  const testCategory = "5x5";
  const testId = "1";

  beforeEach(() => {
    puzzleLibrary = PuzzleLibrary.getInstance();
    // Clean up before each test
    localStorage.removeItem(`nonogram-progress-${testCategory}-${testId}`);
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.removeItem(`nonogram-progress-${testCategory}-${testId}`);
  });

  describe("saveProgress with version", () => {
    it("should save progress with version field", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      puzzleLibrary.saveProgress(testCategory, testId, grid);

      const stored = localStorage.getItem(
        `nonogram-progress-${testCategory}-${testId}`,
      );
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data).toHaveProperty("version");
      expect(data.version).toBe(1);
      expect(data).toHaveProperty("grid");
      expect(data.grid).toEqual(grid);
      expect(data).toHaveProperty("timestamp");
    });
  });

  describe("loadProgress with version validation", () => {
    it("should load progress with matching version", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const data = {
        version: 1,
        grid,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `nonogram-progress-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toEqual(grid);
    });

    it("should return null when no progress saved", () => {
      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when saved data is corrupted", () => {
      localStorage.setItem(
        `nonogram-progress-${testCategory}-${testId}`,
        "corrupted data",
      );

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when version mismatch", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const data = {
        version: 99,
        grid,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `nonogram-progress-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when missing version field", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      const data = {
        grid,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `nonogram-progress-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when missing grid field", () => {
      const data = {
        version: 1,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `nonogram-progress-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toBeUndefined();
    });
  });

  describe("saveProgress and loadProgress round-trip", () => {
    it("should save and load progress correctly", () => {
      const grid = [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ];

      puzzleLibrary.saveProgress(testCategory, testId, grid);

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toEqual(grid);
    });

    it("should clear progress after saving new state", () => {
      const grid1 = [
        [1, 0],
        [0, 1],
      ];

      puzzleLibrary.saveProgress(testCategory, testId, grid1);

      const grid2 = [
        [0, 1],
        [1, 0],
      ];

      puzzleLibrary.saveProgress(testCategory, testId, grid2);

      const loaded = puzzleLibrary.loadProgress(testCategory, testId);
      expect(loaded).toEqual(grid2);
    });
  });

  describe("getProgressKey", () => {
    it("should generate correct key format", () => {
      const key = puzzleLibrary["getProgressKey"](testCategory, testId);

      expect(key).toBe(`nonogram-progress-${testCategory}-${testId}`);
    });
  });
});
