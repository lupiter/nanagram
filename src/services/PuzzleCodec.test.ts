import { puzzleCodec } from "../services/PuzzleCodec";
import { CellState, PuzzleSolutionData } from "../types/nonogram";

describe("puzzleCodec", () => {
  // Helper to create an empty grid
  const createEmptyGrid = (size: number): PuzzleSolutionData =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => CellState.EMPTY)
    );

  // Helper to create a filled grid
  const createFilledGrid = (size: number): PuzzleSolutionData =>
    Array.from({ length: size }, () =>
      Array.from({ length: size }, () => CellState.FILLED)
    );

  // Helper to create a checkerboard pattern
  const createCheckerboard = (size: number): PuzzleSolutionData =>
    Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) =>
        (row + col) % 2 === 0 ? CellState.FILLED : CellState.EMPTY
      )
    );

  describe("round-trip encoding/decoding", () => {
    it("should encode and decode a simple 5x5 puzzle", () => {
      const name = "Heart";
      const solution: PuzzleSolutionData = [
        [CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.FILLED, CellState.EMPTY],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.FILLED],
        [CellState.EMPTY, CellState.FILLED, CellState.FILLED, CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.FILLED, CellState.EMPTY, CellState.EMPTY],
      ];

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
    });

    it("should encode and decode an empty grid", () => {
      const name = "Empty";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
    });

    it("should encode and decode a fully filled grid", () => {
      const name = "Full";
      const solution = createFilledGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
    });

    it("should encode and decode a checkerboard pattern", () => {
      const name = "Checkerboard";
      const solution = createCheckerboard(8);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
    });
  });

  describe("various grid sizes", () => {
    it.each([5, 10, 15, 20, 25])("should handle %dx%d grids", (size) => {
      const name = `Size ${String(size)}`;
      const solution = createCheckerboard(size);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
      expect(decoded.solution.length).toBe(size);
      expect(decoded.solution[0].length).toBe(size);
    });
  });

  describe("name encoding", () => {
    it("should handle ASCII names", () => {
      const name = "Simple ASCII Name";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });

    it("should handle Unicode names", () => {
      const name = "日本語の名前";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });

    it("should handle emoji names", () => {
      const name = "❤️ Heart 💜";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });

    it("should handle mixed Unicode and emoji", () => {
      const name = "Café ☕ naïve résumé 日本 🎉";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });

    it("should handle empty names", () => {
      const name = "";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });

    it("should handle long names", () => {
      const name = "A".repeat(500);
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });
  });

  describe("obfuscation", () => {
    it("should not contain the plaintext name in the encoded string", () => {
      const name = "SuperSecretName";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);

      // The name should not appear as plaintext in base64
      expect(encoded).not.toContain(name);
      // Also check base64 of the name
      expect(encoded).not.toContain(btoa(name));
    });
  });

  describe("URL safety", () => {
    it("should produce URL-safe output (no +, /, or =)", () => {
      // Use a name and grid that would produce problematic base64 chars
      const name = "Test?Name/With+Special=Chars";
      const solution = createCheckerboard(10);

      const encoded = puzzleCodec.encode(name, solution);

      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });

    it("should only contain URL-safe characters", () => {
      const name = "Test";
      const solution = createFilledGrid(15);

      const encoded = puzzleCodec.encode(name, solution);

      // Base64url alphabet: A-Z, a-z, 0-9, -, _
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe("encoding efficiency", () => {
    it("should produce compact output for small puzzles", () => {
      const name = "Heart";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);

      // 5x5 grid = 25 bits = 4 bytes, name ~5 bytes, overhead 3 bytes
      // Total ~12 bytes, base64 ~16 chars
      expect(encoded.length).toBeLessThan(30);
    });

    it("should produce reasonable output for large puzzles", () => {
      const name = "Large Puzzle";
      const solution = createCheckerboard(25);

      const encoded = puzzleCodec.encode(name, solution);

      // 25x25 = 625 bits = 79 bytes, name ~12 bytes, overhead 3 bytes
      // Total ~94 bytes, base64 ~126 chars
      expect(encoded.length).toBeLessThan(150);
    });
  });

  describe("edge cases", () => {
    it("should handle a 1x1 grid", () => {
      const name = "Tiny";
      const solution: PuzzleSolutionData = [[CellState.FILLED]];

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
      expect(decoded.solution).toEqual(solution);
    });

    it("should handle special characters in name", () => {
      const name = "Test\nWith\tSpecial\0Chars";
      const solution = createEmptyGrid(5);

      const encoded = puzzleCodec.encode(name, solution);
      const decoded = puzzleCodec.decode(encoded);

      expect(decoded.name).toBe(name);
    });
  });
});

