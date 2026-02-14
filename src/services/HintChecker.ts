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

  /** 
   * Calculate minimum space needed for a range of hints.
   * This is the sum of hint values plus gaps between them.
   */
  private minSpaceForHints(hints: Hint[], startIdx: number, endIdx: number): number {
    if (startIdx > endIdx || startIdx < 0 || endIdx >= hints.length) {
      return 0;
    }
    let space = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      space += hints[i].hint;
      if (i < endIdx) space += 1; // gap between sequences
    }
    return space;
  }

  /**
   * Check if a sequence at position `start` with `length` could possibly be hint at index `hintIndex`.
   * Uses positional constraints to determine if there's enough room for hints before/after.
   */
  private couldBeHint(
    start: number, 
    length: number, 
    hintIndex: number, 
    hints: Hint[], 
    gridSize: number
  ): boolean {
    // Length must match
    if (hints[hintIndex].hint !== length) {
      return false;
    }
    
    // Check if there's enough space before this position for earlier hints
    const spaceNeededBefore = this.minSpaceForHints(hints, 0, hintIndex - 1);
    if (start < spaceNeededBefore) {
      return false;
    }
    
    // Check if there's enough space after this position for later hints
    const spaceNeededAfter = this.minSpaceForHints(hints, hintIndex + 1, hints.length - 1);
    const spaceAvailableAfter = gridSize - start - length;
    if (spaceAvailableAfter < spaceNeededAfter) {
      return false;
    }
    
    return true;
  }

  /** Check hints against current cell state and mark used hints.
   * Recomputes from scratch so clues are only marked complete when correct and fully satisfied. */
  check(cells: CellState[], hints: Hint[], answerCells: CellState[]): Hint[] {
    const newHints = hints.map(h => ({ hint: h.hint, used: false }));
    const gridSize = cells.length;
    
    const answerSequences = this.findSequences(answerCells);
    const currentSequences = this.findSequences(cells);
    
    // For each current sequence, find which hints it could possibly match.
    // If it can only match ONE hint AND that hint's answer position matches,
    // mark that hint as used.
    
    for (const seq of currentSequences) {
      // Find all hints this sequence could possibly be
      const possibleHintIndices: number[] = [];
      
      for (let hintIndex = 0; hintIndex < newHints.length; hintIndex++) {
        if (newHints[hintIndex].used) continue; // Skip already used hints
        
        if (this.couldBeHint(seq.start, seq.length, hintIndex, newHints, gridSize)) {
          possibleHintIndices.push(hintIndex);
        }
      }
      
      // If this sequence can only match one hint, check if it's correct
      if (possibleHintIndices.length === 1) {
        const hintIndex = possibleHintIndices[0];
        const answerSequence = answerSequences[hintIndex] as { start: number; length: number } | undefined;
        
        if (answerSequence && 
            seq.start === answerSequence.start && 
            seq.length === answerSequence.length) {
          newHints[hintIndex].used = true;
        }
      }
    }

    return newHints;
  }
}

/** Convenience export for the singleton instance */
export const hintChecker = HintChecker.getInstance();
