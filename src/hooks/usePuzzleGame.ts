import { useState, useEffect, useMemo } from "react";
import { GameMode } from "../types/puzzle";
import { GameState } from "../types/nonogram";
import { PuzzleDefinition } from "../types/nonogram";
import { PuzzleState } from "../components/NonogramGrid/PuzzleState";
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
    [category, id, puzzle.solution]
  );

  const [state, setState] = useState<PuzzleState>(() => {
    const savedGrid = puzzleLibrary.loadProgress(category, id) as GameState | null;
    const savedMode = localStorage.getItem(PLAY_MODE_STORAGE_KEY) as GameMode | null;
    return controller.createInitialState(savedGrid, savedMode);
  });

  // Reset state when puzzle changes
  useEffect(() => {
    const savedGrid = puzzleLibrary.loadProgress(category, id) as GameState | null;
    const savedMode = localStorage.getItem(PLAY_MODE_STORAGE_KEY) as GameMode | null;
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
    const { isSolved, justSolved } = controller.checkSolution(state);
    if (justSolved) {
      setState(controller.markSolved(state));
      puzzleLibrary.markCompleted(category, id);
      puzzleLibrary.clearProgress(category, id);
    } else if (!isSolved && controller.hasContent(state)) {
      puzzleLibrary.saveProgress(category, id, state.grid);
    }
  }, [state.grid, controller, category, id, state.isSolved]);

  // Play error sound and clear error after animation
  useEffect(() => {
    if (state.errorCell) {
      void errorSound.play();
      const timer = setTimeout(() => {
        setState(s => controller.clearError(s));
      }, 200);
      return () => { clearTimeout(timer); };
    }
  }, [state.errorCell, controller]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(PLAY_MODE_STORAGE_KEY, state.mode);
  }, [state.mode]);

  // Global mouse up handler for drag
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Use requestAnimationFrame to delay endDrag until after onChange fires
      requestAnimationFrame(() => {
        setState(s => {
          if (s.isDragging) {
            return controller.endDrag(s);
          }
          return s;
        });
      });
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => { window.removeEventListener("mouseup", handleGlobalMouseUp); };
  }, [controller]);

  // Keyboard shortcuts - registered once, uses ref for latest state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          setState(s => controller.redo(s));
        } else {
          setState(s => controller.undo(s));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [controller]);

  return { state, setState, controller };
}
