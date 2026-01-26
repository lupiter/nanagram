import { sssFormat } from "./SSSFormat";
import { CellState, PuzzleSolutionData } from "../types/nonogram";

describe("SSSFormat", () => {
  describe("gridToString", () => {
    it("should convert a 10x15 grid to a 150-character string", () => {
      const grid: PuzzleSolutionData = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => CellState.FILLED)
      );

      const result = sssFormat.gridToString(grid);

      expect(result.length).toBe(150);
      expect(result).toMatch(/^1+$/);
    });

    it("should convert empty cells to 0 and filled to 1", () => {
      const grid: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
      ];

      const result = sssFormat.gridToString(grid);

      expect(result).toBe("101");
    });
  });

  describe("stringToGrid", () => {
    it("should convert a string back to a 10x15 grid", () => {
      const gridString = "1".repeat(150);

      const result = sssFormat.stringToGrid(gridString);

      expect(result.length).toBe(10);
      expect(result[0].length).toBe(15);
      expect(result.flat().every((cell: number) => cell === (CellState.FILLED as number))).toBe(true);
    });

    it("should correctly parse 0s and 1s", () => {
      // First row: all filled, rest empty
      const gridString = "1".repeat(15) + "0".repeat(135);

      const result = sssFormat.stringToGrid(gridString);

      expect(result[0].every((cell: number) => cell === (CellState.FILLED as number))).toBe(true);
      expect(result[1].every((cell: number) => cell === (CellState.EMPTY as number))).toBe(true);
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve grid data through conversion", () => {
      const original: PuzzleSolutionData = Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 15 }, (_, col) =>
          (row + col) % 2 === 0 ? CellState.FILLED : CellState.EMPTY
        )
      );

      const stringified = sssFormat.gridToString(original);
      const restored = sssFormat.stringToGrid(stringified);

      expect(restored).toEqual(original);
    });
  });

  describe("createEmptyFile", () => {
    it("should create a valid empty SSS file structure", () => {
      const file = sssFormat.createEmptyFile();

      expect(file).toHaveProperty("profiles");
      expect(file).toHaveProperty("puzzles");
      expect(Object.keys(file.profiles).length).toBe(0);
      expect(Object.keys(file.puzzles).length).toBe(0);
    });
  });

  describe("generateId", () => {
    it("should generate a 16-character ID", () => {
      const id = sssFormat.generateId();

      expect(id.length).toBe(16);
    });

    it("should generate uppercase letters only", () => {
      const id = sssFormat.generateId();

      expect(id).toMatch(/^[A-Z]+$/);
    });

    it("should generate unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(sssFormat.generateId());
      }

      expect(ids.size).toBe(100);
    });
  });

  describe("addPuzzle", () => {
    it("should add a puzzle to an empty file", () => {
      const file = sssFormat.createEmptyFile();
      const grid: number[][] = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => 1)
      );

      const result = sssFormat.addPuzzle(file, { title: "Test", grid }, "TestCreator");

      expect(Object.keys(result.puzzles).length).toBe(1);
      expect(Object.keys(result.profiles).length).toBe(1);
    });

    it("should use the provided creator name", () => {
      const file = sssFormat.createEmptyFile();
      const grid: number[][] = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => 0)
      );

      const result = sssFormat.addPuzzle(file, { title: "Test", grid }, "MyName");

      const profileId = Object.keys(result.profiles)[0];
      expect(result.profiles[profileId].name).toBe("MyName");
    });

    it("should set the puzzle title", () => {
      const file = sssFormat.createEmptyFile();
      const grid: number[][] = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => 1)
      );

      const result = sssFormat.addPuzzle(file, { title: "My Puzzle", grid }, "Creator");

      const puzzleId = Object.keys(result.puzzles)[0];
      expect(result.puzzles[puzzleId].title).toBe("My Puzzle");
    });
  });

  describe("getAllPuzzles", () => {
    it("should return an empty array for an empty file", () => {
      const file = sssFormat.createEmptyFile();

      const puzzles = sssFormat.getAllPuzzles(file);

      expect(puzzles).toEqual([]);
    });

    it("should return all puzzles with their creators", () => {
      let file = sssFormat.createEmptyFile();
      const grid: number[][] = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => 1)
      );

      file = sssFormat.addPuzzle(file, { title: "Puzzle 1", grid }, "Creator1");
      file = sssFormat.addPuzzle(file, { title: "Puzzle 2", grid }, "Creator2");

      const puzzles = sssFormat.getAllPuzzles(file);

      expect(puzzles.length).toBe(2);
      expect(puzzles[0].creator).toBeDefined();
      expect(puzzles[1].creator).toBeDefined();
    });
  });

  describe("parse", () => {
    it("should return null for invalid JSON", () => {
      const result = sssFormat.parse("not valid json");

      expect(result).toBeNull();
    });

    it("should return null for JSON without required fields", () => {
      const result = sssFormat.parse('{"foo": "bar"}');

      expect(result).toBeNull();
    });

    it("should parse a valid SSS file", () => {
      const file = sssFormat.createEmptyFile();
      const json = JSON.stringify(file);

      const result = sssFormat.parse(json);

      expect(result).toEqual(file);
    });
  });

  describe("addPuzzles", () => {
    it("should add multiple puzzles at once", () => {
      const file = sssFormat.createEmptyFile();
      const grid: PuzzleSolutionData = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => CellState.FILLED)
      );

      const puzzles = [
        { title: "Puzzle 1", grid },
        { title: "Puzzle 2", grid },
        { title: "Puzzle 3", grid },
      ];

      const result = sssFormat.addPuzzles(file, puzzles, "Creator", false);

      expect(result.added).toBe(3);
      expect(result.skipped).toBe(0);
      expect(Object.keys(result.file.puzzles).length).toBe(3);
    });

    it("should skip duplicates when deduplication is enabled", () => {
      let file = sssFormat.createEmptyFile();
      const grid: PuzzleSolutionData = Array.from({ length: 10 }, () =>
        Array.from({ length: 15 }, () => CellState.FILLED)
      );

      // Add one puzzle first
      file = sssFormat.addPuzzle(file, { title: "Existing", grid: grid.map(r => r.map(c => c as number)) }, "Creator");

      // Try to add the same grid again
      const result = sssFormat.addPuzzles(file, [{ title: "Duplicate", grid }], "Creator", true);

      expect(result.added).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });
});
