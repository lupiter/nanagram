import { describe, it, expect } from "@jest/globals";
import {
  ErrorType,
  ClueError,
  CompletionError,
  CellError,
  errorTracker,
} from "./ErrorTracker";
import { CellState, PuzzleSolutionData } from "../types/nonogram";

describe("ErrorTracker", () => {
  describe("calculateClueRequirements", () => {
    it("should calculate requirements for a row", () => {
      const row = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
      ];

      const result = errorTracker.calculateClueRequirements(row, true);

      expect(result.maxRequired).toBe(2);
      expect(result.satisfied).toBe(2);
    });

    it("should calculate requirements for a column", () => {
      const column = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
      ];

      const result = errorTracker.calculateClueRequirements(column, false);

      expect(result.maxRequired).toBe(2);
      expect(result.satisfied).toBe(2);
    });

    it("should handle empty row", () => {
      const row = Array(10).fill(CellState.EMPTY);

      const result = errorTracker.calculateClueRequirements(row, true);

      expect(result.maxRequired).toBe(0);
      expect(result.satisfied).toBe(0);
    });

    it("should handle fully filled row", () => {
      const row = Array(10).fill(CellState.FILLED);

      const result = errorTracker.calculateClueRequirements(row, true);

      expect(result.maxRequired).toBe(10);
      expect(result.satisfied).toBe(1);
    });
  });

  describe("canClueBeSatisfied", () => {
    it("should detect if clue can be satisfied", () => {
      const row = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
      ];

      const canBeSatisfied = errorTracker.canClueBeSatisfied(
        row,
        true,
        0,
        [2, 1],
      );

      expect(canBeSatisfied).toBe(true);
    });

    it("should detect unsatisfied clue", () => {
      const row = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.FILLED,
      ];

      const canBeSatisfied = errorTracker.canClueBeSatisfied(
        row,
        true,
        0,
        [2, 1],
      );

      expect(canBeSatisfied).toBe(false);
    });

    it("should handle multiple clues", () => {
      const row = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];

      const canBeSatisfied = errorTracker.canClueBeSatisfied(
        row,
        true,
        0,
        [2, 1, 3, 1],
      );

      expect(canBeSatisfied).toBe(true);
    });
  });

  describe("detectCellErrors", () => {
    it("should detect filled cell where solution expects empty", () => {
      const grid: number[][] = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const errors = errorTracker.detectCellErrors(grid, solution);

      expect(errors.length).toBe(2);
      expect(errors[0]).toMatchObject({
        type: ErrorType.CELL,
        current: CellState.FILLED,
        expected: CellState.EMPTY,
        reason: "Filled cell where solution expects empty",
      });
    });

    it("should detect crossed-out cell where solution expects filled", () => {
      const grid: number[][] = [
        [CellState.CROSSED_OUT, CellState.EMPTY],
        [CellState.EMPTY, CellState.CROSSED_OUT],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const errors = errorTracker.detectCellErrors(grid, solution);

      expect(errors.length).toBe(2);
      expect(errors[0]).toMatchObject({
        type: ErrorType.CELL,
        current: CellState.CROSSED_OUT,
        expected: CellState.FILLED,
        reason: "Crossed-out cell where solution expects filled",
      });
    });

    it("should not report errors for correct cells", () => {
      const grid: number[][] = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const errors = errorTracker.detectCellErrors(grid, solution);

      expect(errors.length).toBe(0);
    });
  });

  describe("detectClueErrors", () => {
    it("should detect unsatisfied row clue", () => {
      const grid: number[][] = [
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
      ];

      const rowHints = [[5, 3] as any];
      const columnHints = [] as any;

      const errors = errorTracker.detectClueErrors(grid, rowHints, columnHints);

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject({
        type: ErrorType.CLUE,
        row: 0,
        reason: "Row clue cannot be satisfied with current state",
      });
    });

    it("should detect unsatisfied column clue", () => {
      const grid: number[][] = [
        [CellState.EMPTY],
        [CellState.EMPTY],
      ];

      const rowHints = [] as any;
      const columnHints = [[2, 1] as any];

      const errors = errorTracker.detectClueErrors(grid, rowHints, columnHints);

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject({
        type: ErrorType.CLUE,
        col: 0,
        reason: "Column clue cannot be satisfied with current state",
      });
    });
  });

  describe("detectCompletionErrors", () => {
    it("should detect puzzle that cannot be completed", () => {
      const grid: number[][] = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.FILLED],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const errors = errorTracker.detectCompletionErrors(grid, solution);

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject({
        type: ErrorType.COMPLETION,
        reason: "Puzzle cannot be completed from current state. Some filled cells are marked incorrectly or empty cells are marked as crossed out.",
      });
    });

    it("should detect crossed-out cell in solution", () => {
      const grid: number[][] = [
        [CellState.CROSSED_OUT, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const errors = errorTracker.detectCompletionErrors(grid, solution);

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject({
        type: ErrorType.COMPLETION,
      });
    });

    it("should not report errors for completable puzzle", () => {
      const grid: number[][] = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.FILLED],
      ];

      const errors = errorTracker.detectCompletionErrors(grid, solution);

      expect(errors.length).toBe(0);
    });
  });

  describe("detectErrors", () => {
    it("should detect all types of errors", () => {
      const grid: number[][] = [
        [CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const rowHints = [[1] as any];
      const columnHints = [[1] as any];
      const solution: PuzzleSolutionData = [
        [CellState.FILLED, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY],
      ];

      const errors = errorTracker.detectErrors(
        grid,
        rowHints,
        columnHints,
        solution,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.type === ErrorType.CLUE)).toBe(true);
      expect(errors.some((e) => e.type === ErrorType.COMPLETION)).toBe(true);
    });
  });

  describe("getErrorCounts", () => {
    it("should count errors by type", () => {
      const errors: (CellError | ClueError | CompletionError)[] = [
        {
          type: ErrorType.CELL,
          row: 0,
          col: 0,
          current: CellState.FILLED,
          expected: CellState.EMPTY,
          reason: "Filled cell where solution expects empty",
        },
        {
          type: ErrorType.CELL,
          row: 0,
          col: 1,
          current: CellState.CROSSED_OUT,
          expected: CellState.FILLED,
          reason: "Crossed-out cell where solution expects filled",
        },
        {
          type: ErrorType.CLUE,
          row: 0,
          col: -1,
          hintIndex: 0,
          required: 2,
          current: 0,
          reason: "Row clue cannot be satisfied",
        },
        {
          type: ErrorType.CLUE,
          row: 1,
          col: -1,
          hintIndex: 0,
          required: 1,
          current: 0,
          reason: "Column clue cannot be satisfied",
        },
        {
          type: ErrorType.COMPLETION,
          reason: "Puzzle cannot be completed",
        },
      ];

      const counts = errorTracker.getErrorCounts(errors);

      expect(counts.cell).toBe(2);
      expect(counts.clue).toBe(2);
      expect(counts.completion).toBe(1);
    });
  });
});
