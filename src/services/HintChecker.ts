import { CellState, Hint } from "../types/nonogram";

/**
 * HintChecker - Singleton for checking hint completion
 */
export class HintChecker {
  private static instance: HintChecker;

  static getInstance(): HintChecker {
    HintChecker.instance ??= new HintChecker();
    return HintChecker.instance;
  }

  /** Check hints against current cell state and mark used hints.
   * Recomputes from scratch. A block is marked if it matches an answer sequence
   * and is sealed (bounded by CROSSED_OUT or grid edges). */
  check(cells: CellState[], hints: Hint[], answerCells: CellState[]): Hint[] {
    // If any of the answers are wrong, just return the original hints
    for (let i = 0; i < cells.length; i++) {
      if (
        cells[i] === CellState.FILLED &&
        answerCells[i] !== CellState.FILLED
      ) {
        console.log("early exit, wrong");
        return hints;
      }
    }
    // If all answers are correct, mark used hints and return
    if (cells.every((cell, i) => cell === answerCells[i])) {
      console.log("early exit, finished");
      return hints.map((hint) => ({ ...hint, used: true }));
    }

    // Check each answer against the current cell state and mark used hints
    let sealed = true;
    const resolvedHints: Hint[] = [];
    let currentHintSize = 0;
    let usedHint = true;
    for (let i = 0; i < answerCells.length; i++) {
      console.log(
        i,
        answerCells[i],
        cells[i],
        resolvedHints,
        currentHintSize,
        usedHint,
        sealed,
      );
      if (answerCells[i] === CellState.FILLED) {
        currentHintSize++;
        usedHint = usedHint && cells[i] === CellState.FILLED && sealed;
      } else if (
        (answerCells[i] === CellState.CROSSED_OUT ||
          answerCells[i] === CellState.EMPTY) &&
        cells[i] === CellState.CROSSED_OUT
      ) {
        if (currentHintSize > 0) {
          resolvedHints.push({ hint: currentHintSize, used: usedHint });
        }
        currentHintSize = 0;
        usedHint = true;
        sealed = true;
      } else if (cells[i] === CellState.EMPTY) {
        if (
          (answerCells[i] === CellState.CROSSED_OUT ||
            answerCells[i] === CellState.EMPTY) &&
          currentHintSize > 0
        ) {
          resolvedHints.push({ hint: currentHintSize, used: false });
        }
        currentHintSize = 0;
        usedHint = true;
        sealed = false;
      }
    }
    if (currentHintSize > 0) {
      resolvedHints.push({ hint: currentHintSize, used: usedHint });
    }
    return resolvedHints;
  }
}

/** Convenience export for the singleton instance */
export const hintChecker = HintChecker.getInstance();
