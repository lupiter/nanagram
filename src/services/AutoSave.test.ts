import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { AutoSave } from "./AutoSave";

describe("AutoSave", () => {
  let autoSave: AutoSave;
  let testCategory: string;
  let testId: string;

  beforeEach(() => {
    autoSave = AutoSave.getInstance();
    testCategory = "test-category";
    testId = "test-123";
  });

  afterEach(() => {
    // Cleanup after each test
    autoSave.clearAutoSave(testCategory, testId);
  });

  describe("queueAutoSave", () => {
    it("should save grid to localStorage", () => {
      const grid = [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ];

      autoSave.queueAutoSave(testCategory, testId, grid);

      // Wait for the timeout to trigger
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const saved = localStorage.getItem(`nonogram-auto-save-${testCategory}-${testId}`);
          expect(saved).not.toBeNull();
          const parsed = JSON.parse(saved!);
          expect(parsed).toEqual(grid);
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
          const saved = localStorage.getItem(`nonogram-auto-save-${testCategory}-${testId}`);
          const parsed = JSON.parse(saved!);
          expect(parsed).toEqual(grid2);
          resolve();
        }, 600);
      });
    });
  });

  describe("loadAutoSave", () => {
    it("should load previously saved grid", () => {
      const grid = [[1, 0, 1], [0, 1, 0]];
      localStorage.setItem(`nonogram-auto-save-${testCategory}-${testId}`, JSON.stringify(grid));

      const loaded = autoSave.loadAutoSave(testCategory, testId);
      expect(loaded).toEqual(grid);
    });

    it("should return null when no auto-save exists", () => {
      const loaded = autoSave.loadAutoSave(testCategory, testId);
      expect(loaded).toBeNull();
    });
  });

  describe("clearAutoSave", () => {
    it("should remove auto-save from localStorage", () => {
      const grid = [[0, 1], [1, 0]];
      localStorage.setItem(`nonogram-auto-save-${testCategory}-${testId}`, JSON.stringify(grid));

      autoSave.clearAutoSave(testCategory, testId);
      const saved = localStorage.getItem(`nonogram-auto-save-${testCategory}-${testId}`);
      expect(saved).toBeNull();
    });
  });

  describe("hasAutoSave", () => {
    it("should return true when auto-save exists", () => {
      localStorage.setItem(`nonogram-auto-save-${testCategory}-${testId}`, JSON.stringify([]));

      const hasSave = autoSave.hasAutoSave(testCategory, testId);
      expect(hasSave).toBe(true);
    });

    it("should return false when no auto-save exists", () => {
      const hasSave = autoSave.hasAutoSave(testCategory, testId);
      expect(hasSave).toBe(false);
    });
  });

  describe("shouldAutoSave", () => {
    it("should return true when puzzle has content and is not solved", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, true, false);
      expect(result).toBe(true);
    });

    it("should return false when puzzle is empty", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, false, false);
      expect(result).toBe(false);
    });

    it("should return false when puzzle is solved", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, true, true);
      expect(result).toBe(false);
    });
  });

  describe("cleanupOldSaves", () => {
    it("should remove saves older than specified days", () => {
      const oldKey = `nonogram-auto-save-old-${testCategory}-${testId}`;
      const newKey = `nonogram-auto-save-new-${testCategory}-${testId}`;

      const oldData = { grid: [[1, 0]], timestamp: Date.now() - 1000000 };
      const newData = { grid: [[0, 1]], timestamp: Date.now() };

      localStorage.setItem(oldKey, JSON.stringify(oldData));
      localStorage.setItem(newKey, JSON.stringify(newData));

      autoSave.cleanupOldSaves(0);

      expect(localStorage.getItem(oldKey)).toBeNull();
      expect(localStorage.getItem(newKey)).not.toBeNull();
    });

    it("should not remove recent saves", () => {
      const recentKey = `nonogram-auto-save-recent-${testCategory}-${testId}`;
      const recentData = { grid: [[0, 1]], timestamp: Date.now() };

      localStorage.setItem(recentKey, JSON.stringify(recentData));

      autoSave.cleanupOldSaves(1);

      expect(localStorage.getItem(recentKey)).not.toBeNull();
    });
  });

  describe("getAllAutoSaveKeys", () => {
    it("should return all auto-save keys in localStorage", () => {
      const key1 = `nonogram-auto-save-1-${testCategory}-test1`;
      const key2 = `nonogram-auto-save-2-${testCategory}-test2`;
      const otherKey = "some-other-key";

      localStorage.setItem(key1, "[]");
      localStorage.setItem(key2, "[]");
      localStorage.setItem(otherKey, "[]");

      const keys = autoSave.getAllAutoSaveKeys();

      expect(keys).toContain(key1);
      expect(keys).toContain(key2);
      expect(keys).not.toContain(otherKey);
    });

    it("should return empty array when no auto-save keys exist", () => {
      // Clear all auto-save keys before testing
      Object.keys(localStorage)
        .filter((key) => key.startsWith("nonogram-auto-save-"))
        .forEach((key) => {
          localStorage.removeItem(key);
        });

      const keys = autoSave.getAllAutoSaveKeys();
      expect(keys).toEqual([]);
    });
  });

  describe("shouldAutoSave", () => {
    it("should handle empty grid", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, false, false);
      expect(result).toBe(false);
    });

    it("should handle solved puzzle", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, true, true);
      expect(result).toBe(false);
    });

    it("should handle unsolved puzzle with content", () => {
      const result = autoSave.shouldAutoSave(testCategory, testId, true, false);
      expect(result).toBe(true);
    });
  });
});
