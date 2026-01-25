import { useState, useEffect, useMemo } from "react";
import { DesignerState, createInitialDesignerState } from "../components/DesignerControls/DesignerState";
import { DesignerController } from "../components/DesignerControls/DesignerController";
import { puzzleService } from "../services/Puzzle";

export function useDesigner(height: number, width?: number) {
  const controller = useMemo(() => new DesignerController(), []);
  const w = width ?? height;
  const [state, setState] = useState<DesignerState>(() => createInitialDesignerState(height, w));

  // Check solution uniqueness with debounce
  useEffect(() => {
    if (!controller.hasFilledCells(state)) {
      if (state.hasUniqueSolution !== null) {
        setState(s => controller.setUniqueSolution(s, null));
      }
      return;
    }

    setState(s => controller.setChecking(s, true));

    const timer = setTimeout(() => {
      const result = puzzleService.checkPuzzleHasUniqueSolution(state.grid);
      setState(s => controller.setUniqueSolution(s, result));
    }, 300);

    return () => { clearTimeout(timer); };
  }, [state.grid, state.hasUniqueSolution, controller]);

  // Global mouse up handler for drag
  useEffect(() => {
    const handleGlobalMouseUp = () => {
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

  return { state, setState, controller };
}

