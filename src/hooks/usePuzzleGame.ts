import { useState, useEffect, useMemo } from "react";
import { GameMode, WorkingGrid } from "../types/puzzle";
import { PuzzleDefinition } from "../types/nonogram";
import { PuzzleState } from "../controllers/PuzzleState";
import { PuzzleController } from "../controllers/PuzzleController";
import {
  markPuzzleCompleted,
  saveProgress,
  loadProgress,
  clearProgress,
} from "../utils/puzzleLoader";
import { errorSound } from "../utils/errorSound";

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
    const savedGrid = loadProgress(category, id) as WorkingGrid | null;
    const savedMode = localStorage.getItem("gameMode") as GameMode | null;
    return controller.createInitialState(savedGrid, savedMode);
  });

  // Reset state when puzzle changes
  useEffect(() => {
    const savedGrid = loadProgress(category, id) as WorkingGrid | null;
    const savedMode = localStorage.getItem("gameMode") as GameMode | null;
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
      markPuzzleCompleted(category, id);
      clearProgress(category, id);
    } else if (!isSolved && controller.hasContent(state)) {
      saveProgress(category, id, state.grid);
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
    localStorage.setItem("gameMode", state.mode);
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
