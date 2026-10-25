import { renderHook, waitFor } from "@testing-library/react";
import { usePuzzleGame } from "./usePuzzleGame";
import { CellState, PuzzleSolutionData, PuzzleDefinition } from "../types/nonogram";

// Mock the ErrorSound singleton to avoid AudioContext issues in tests
jest.mock("../services/ErrorSound", () => ({
  errorSound: {
    play: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn(),
  },
}));

describe("usePuzzleGame error detection", () => {
  const mockSolution: PuzzleSolutionData = [
    [CellState.EMPTY, CellState.FILLED],
    [CellState.FILLED, CellState.EMPTY],
  ];

  const mockPuzzle: PuzzleDefinition = {
    name: "Test Puzzle",
    height: 2,
    width: 2,
    difficulty: 1,
    solution: mockSolution,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not detect errors on empty grid", async () => {
    const { result } = renderHook(() =>
      usePuzzleGame({
        category: "test",
        id: "1",
        puzzle: mockPuzzle,
      }),
    );

    // Initially no error cell should be set
    expect(result.current.state.errorCell).toBeNull();

    // Fast-forward 2 seconds (error detection interval)
    jest.advanceTimersByTime(2000);

    // Wait for error detection to run
    await waitFor(() => {
      expect(result.current.state.errorCell).toBeNull();
    }, { timeout: 3000 });
  });

  it("should detect errors after player starts playing", async () => {
    const { result } = renderHook(() =>
      usePuzzleGame({
        category: "test",
        id: "1",
        puzzle: mockPuzzle,
      }),
    );

    // Initially no error cell
    expect(result.current.state.errorCell).toBeNull();

    // Player marks a cell (simulating user interaction)
    result.current.setState((s) => {
      return {
        ...s,
        grid: s.grid.map((row, i) =>
          row.map((cell, j) =>
            i === 0 && j === 1 ? CellState.CROSSED_OUT : cell,
          ),
        ),
      };
    });

    // Fast-forward 2 seconds (error detection interval)
    jest.advanceTimersByTime(2000);

    // Wait for error detection to run
    await waitFor(() => {
      expect(result.current.state.errorCell).not.toBeNull();
    }, { timeout: 3000 });
  });
});
