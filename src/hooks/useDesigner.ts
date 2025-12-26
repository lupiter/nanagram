import { useState, useEffect, useMemo } from "react";
import { DesignerState, createInitialState } from "../controllers/DesignerState";
import { DesignerController } from "../controllers/DesignerController";
import { checkPuzzleHasUniqueSolution } from "../utils/puzzleUtils";

export function useDesigner(size: number) {
  const controller = useMemo(() => new DesignerController(), []);
  const [state, setState] = useState<DesignerState>(() => createInitialState(size));

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
      const result = checkPuzzleHasUniqueSolution(state.grid);
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

