import { useState, useEffect, useMemo, useRef } from "react";
import { createInitialDesignerState } from "../components/DesignerControls/DesignerState";
import { DesignerState } from "../types/design";

import { DesignerController } from "../components/DesignerControls/DesignerController";
import { puzzleService } from "../services/Puzzle";

export function useDesigner(height: number, width?: number) {
  const controller = useMemo(() => new DesignerController(), []);
  const w = width ?? height;
  const [state, setState] = useState<DesignerState>(() =>
    createInitialDesignerState(height, w),
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  // Check solution uniqueness with debounce. Skip while dragging so we don't
  // apply validation updates on top of in-progress pointer interaction.
  useEffect(() => {
    if (!state.autoCheckEnabled) return;

    if (!controller.hasFilledCells(state)) {
      if (state.hasUniqueSolution !== null) {
        setState((s) => controller.setUniqueSolution(s, null));
      }
      return;
    }

    setState((s) => controller.setChecking(s, true));

    const gridBeingValidated = state.grid;
    const timer = setTimeout(() => {
      const result =
        puzzleService.checkPuzzleHasUniqueSolution(gridBeingValidated);
      setState((s) => {
        if (s.grid !== gridBeingValidated) return s;
        return controller.setUniqueSolution(s, result);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [state.grid, state.hasUniqueSolution, state.autoCheckEnabled, controller]);

  return { state, setState, controller };
}
