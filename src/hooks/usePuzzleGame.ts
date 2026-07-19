import { useState, useEffect, useMemo, useRef } from "react";
import { GameMode, PuzzleStatus, PuzzleState } from "../types/puzzle";
import { GameState, PuzzleDefinition } from "../types/nonogram";
import { PuzzleController } from "../components/NonogramGrid/PuzzleController";
import { puzzleLibrary } from "../services/PuzzleLibrary";
import { errorSound } from "../services/ErrorSound";
import { PLAY_MODE_STORAGE_KEY } from "../themeStorage";

interface UsePuzzleGameProps {
  category: string;
  id: string;
  puzzle: PuzzleDefinition;
}

export function usePuzzleGame({ category, id, puzzle }: UsePuzzleGameProps) {
  const controller = useMemo(
    () => new PuzzleController({ category, id, solution: puzzle.solution }),
    [category, id, puzzle.solution],
  );

  const [state, setState] = useState<PuzzleState>(() => {
    const savedGrid = puzzleLibrary.loadProgress(
      category,
      id,
    ) as GameState | null;
    const savedMode = localStorage.getItem(
      PLAY_MODE_STORAGE_KEY,
    ) as GameMode | null;
    return controller.createInitialState(savedGrid, savedMode);
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  // Reset state when puzzle changes
  useEffect(() => {
    const savedGrid = puzzleLibrary.loadProgress(
      category,
      id,
    ) as GameState | null;
    const savedMode = localStorage.getItem(
      PLAY_MODE_STORAGE_KEY,
    ) as GameMode | null;
    setState(controller.createInitialState(savedGrid, savedMode));
  }, [controller, category, id]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      void errorSound.cleanup();
    };
  }, []);

  // Check solution and handle victory/progress saving
  useEffect(() => {
    if (state.status === PuzzleStatus.Solved) {
      puzzleLibrary.markCompleted(category, id);
      puzzleLibrary.clearProgress(category, id);
    } else if (
      state.status === PuzzleStatus.Playing &&
      controller.hasContent(state)
    ) {
      puzzleLibrary.saveProgress(category, id, state.grid);
    }
  }, [state.grid, state.status, controller, category, id]);

  // Play error sound and clear error after animation
  useEffect(() => {
    if (state.errorCell) {
      void errorSound.play();
      const timer = setTimeout(() => {
        setState((s) => controller.dispatch(s, { type: "CLEAR_ERROR" }));
      }, 200);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [state.errorCell, controller]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(PLAY_MODE_STORAGE_KEY, state.mode);
  }, [state.mode]);

  // Keyboard shortcuts - registered once, uses ref for latest state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          setState((s) => controller.dispatch(s, { type: "REDO_REQUESTED" }));
        } else {
          setState((s) => controller.dispatch(s, { type: "UNDO_REQUESTED" }));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [controller]);

  return { state, setState, controller };
}
