import { useState, useEffect, useMemo, useRef } from "react";
import { DesignerState, createInitialDesignerState } from "../components/DesignerControls/DesignerState";
import { DesignerController } from "../components/DesignerControls/DesignerController";
import { puzzleService } from "../services/Puzzle";

/** Ref populated when a drag ends with the cell keys "row,col" that were part of the drag. Used to ignore the synthetic click that follows a tap. */
export type DragJustEndedRef = React.MutableRefObject<Set<string> | null>;

export function useDesigner(height: number, width?: number) {
  const controller = useMemo(() => new DesignerController(), []);
  const w = width ?? height;
  const [state, setState] = useState<DesignerState>(() => createInitialDesignerState(height, w));
  const dragJustEndedCellsRef = useRef<Set<string> | null>(null);

  // Check solution uniqueness with debounce. Skip while dragging so we don't
  // apply validation updates on top of in-progress pointer interaction.
  useEffect(() => {
    if (state.isDragging) return;

    if (!controller.hasFilledCells(state)) {
      if (state.hasUniqueSolution !== null) {
        setState(s => controller.setUniqueSolution(s, null));
      }
      return;
    }

    setState(s => controller.setChecking(s, true));

    const gridBeingValidated = state.grid;
    const timer = setTimeout(() => {
      const result = puzzleService.checkPuzzleHasUniqueSolution(gridBeingValidated);
      setState(s => {
        if (s.grid !== gridBeingValidated) return s;
        return controller.setUniqueSolution(s, result);
      });
    }, 300);

    return () => { clearTimeout(timer); };
  }, [state.grid, state.hasUniqueSolution, state.isDragging, controller]);

  // Global pointer up/cancel handler for drag (works for mouse and touch)
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      requestAnimationFrame(() => {
        setState(s => {
          if (s.isDragging) {
            const cells = new Set<string>();
            s.draggedCells.forEach((cols, r) =>
              cols.forEach(c => cells.add(`${String(r)},${String(c)}`))
            );
            dragJustEndedCellsRef.current = cells;
            return controller.endDrag(s);
          }
          return s;
        });
      });
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [controller]);

  return { state, setState, controller, dragJustEndedCellsRef };
}

