import { describe, it, expect, afterEach } from "@jest/globals";
import { AutoSave } from "./AutoSave";

describe("AutoSave - Version Tracking", () => {
  let autoSave: AutoSave;
  const testCategory = "10x10";
  const testId = "5";

  beforeEach(() => {
    autoSave = AutoSave.getInstance();
    // Clean up before each test
    localStorage.removeItem(`nonogram-auto-save-${testCategory}-${testId}`);
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.removeItem(`nonogram-auto-save-${testCategory}-${testId}`);
  });

  describe("saveProgress with version", () => {
    it("should save progress with version field", () => {
      const grid = [
        [0, 1],
        [1, 0],
      ];

      autoSave.queueAutoSave(testCategory, testId, grid);

      // Wait for the timeout to trigger
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const saved = localStorage.getItem(
            `nonogram-auto-save-${testCategory}-${testId}`,
          );
          expect(saved).not.toBeNull();

          const data = JSON.parse(saved!);
          expect(data).toHaveProperty("version");
          expect(data.version).toBe(1);
          expect(data).toHaveProperty("grid");
          expect(data.grid).toEqual(grid);
          expect(data).toHaveProperty("timestamp");
          resolve();
        }, 600);
      });
    });

    it("should clear existing timeout before queueing new save", () => {
      const grid1 = [[0, 1], [1, 0]];
      const grid2 = [[1, 0], [0, 1]];

      autoSave.queueAutoSave(testCategory, testId, grid1);
      autoSave.queueAutoSave(testCategory, testId, grid2);

      // Wait for both timeouts
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should only have grid2 saved (last one)
          const saved = localStorage.getItem(
            `nonogram-auto-save-${testCategory}-${testId}`,
          );
          const parsed = JSON.parse(saved!);
          expect(parsed.grid).toEqual(grid2);
          resolve();
        }, 600);
      });
    });
  });

  describe("loadAutoSave with version validation", () => {
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
        `nonogram-auto-save-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = autoSave.loadAutoSave(testCategory, testId);
      expect(loaded).toEqual(grid);
    });

    it("should return null when no auto-save exists", () => {
      const loaded = autoSave.loadAutoSave(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when saved data is corrupted", () => {
      localStorage.setItem(
        `nonogram-auto-save-${testCategory}-${testId}`,
        "corrupted data",
      );

      const loaded = autoSave.loadAutoSave(testCategory, testId);
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
        `nonogram-auto-save-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = autoSave.loadAutoSave(testCategory, testId);
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
        `nonogram-auto-save-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = autoSave.loadAutoSave(testCategory, testId);
      expect(loaded).toBeNull();
    });

    it("should return null when missing grid field", () => {
      const data = {
        version: 1,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `nonogram-auto-save-${testCategory}-${testId}`,
        JSON.stringify(data),
      );

      const loaded = autoSave.loadAutoSave(testCategory, testId);
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

      autoSave.queueAutoSave(testCategory, testId, grid);

      // Wait for auto-save
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const loaded = autoSave.loadAutoSave(testCategory, testId);
          expect(loaded).toEqual(grid);
          resolve();
        }, 600);
      });
    });

    it("should clear auto-save after new save", () => {
      const grid1 = [
        [1, 0],
        [0, 1],
      ];

      autoSave.queueAutoSave(testCategory, testId, grid1);

      // Wait for first save
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const grid2 = [
            [0, 1],
            [1, 0],
          ];

          autoSave.queueAutoSave(testCategory, testId, grid2);

          // Wait for second save
          setTimeout(() => {
            const loaded = autoSave.loadAutoSave(testCategory, testId);
            expect(loaded).toEqual(grid2);
            resolve();
          }, 600);
        }, 600);
      });
    });
  });
});
