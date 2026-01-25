/**
 * HintChecker - Checks and updates hint completion status
 */

import { CellState, Hint } from "../types/nonogram";

/**
 * HintChecker - Singleton for checking hint completion
 */
export class HintChecker {
  private static instance: HintChecker;

  static getInstance(): HintChecker {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    HintChecker.instance ??= new HintChecker();
    return HintChecker.instance;
  }

  /** Find all sequences of filled cells in a row/column */
  private findSequences(cells: CellState[]): { start: number; length: number }[] {
    const sequences: { start: number; length: number }[] = [];
    let currentSequenceStart = -1;
    let currentSequenceLength = 0;
    
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === CellState.FILLED) {
        if (currentSequenceStart === -1) {
          currentSequenceStart = i;
        }
        currentSequenceLength++;
      } else if (currentSequenceStart !== -1) {
        sequences.push({ start: currentSequenceStart, length: currentSequenceLength });
        currentSequenceStart = -1;
        currentSequenceLength = 0;
      }
    }
    
    if (currentSequenceStart !== -1) {
      sequences.push({ start: currentSequenceStart, length: currentSequenceLength });
    }
    
    return sequences;
  }

  /** Check hints against current cell state and mark used hints */
  check(cells: CellState[], hints: Hint[], answerCells: CellState[]): Hint[] {
    const newHints = [...hints];
    
    const answerSequences = this.findSequences(answerCells);
    const currentSequences = this.findSequences(cells);
    
    // For each hint, check if its corresponding sequence in the answer is filled correctly
    for (let hintIndex = 0; hintIndex < newHints.length; hintIndex++) {
      const hint = newHints[hintIndex];
      if (hint.used) continue; // Skip if already used
      
      // Find the corresponding sequence in the answer for this hint
      const answerSequence = answerSequences[hintIndex] as { start: number; length: number } | undefined;
      if (answerSequence === undefined) continue;
      
      // Find a matching sequence in the current state
      hint.used = currentSequences.some(seq => 
        seq.start === answerSequence.start && seq.length === answerSequence.length
      );
    }

    return newHints;
  }
}

/** Convenience export for the singleton instance */
export const hintChecker = HintChecker.getInstance();
