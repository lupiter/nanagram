import { useState, useEffect, useMemo } from "react";
import { DesignerState, createInitialState } from "../controllers/DesignerState";
import { DesignerController } from "../controllers/DesignerController";
import { checkPuzzleHasUniqueSolution } from "../utils/puzzleUtils";

export function useDesigner() {
  const controller = useMemo(() => new DesignerController(), []);
  const [state, setState] = useState<DesignerState>(() => createInitialState());

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

    return () => clearTimeout(timer);
  }, [state.grid]); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, setState, controller };
}

