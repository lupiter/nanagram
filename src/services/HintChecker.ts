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
   * Check whether the cells before `start` contain filled blocks that exactly match
   * hints 0..hintIndex-1. If there are no filled cells before us, only hintIndex 0 is valid.
   */
  private precedingCellsMatchHints(
    cells: CellState[],
    start: number,
    hints: Hint[],
    hintIndex: number
  ): boolean {
    if (hintIndex <= 0) return true;
    const preceding = cells.slice(0, start);
    const blocks = this.findSequences(preceding);
    if (blocks.length !== hintIndex) return false;
    for (let i = 0; i < hintIndex; i++) {
      if (blocks[i].length !== hints[i].hint) return false;
    }
    return true;
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
      // Find all hints this sequence could possibly be (by position/size constraints)
      const possibleHintIndices: number[] = [];
      
      for (let hintIndex = 0; hintIndex < newHints.length; hintIndex++) {
        if (newHints[hintIndex].used) continue; // Skip already used hints
        
        if (this.couldBeHint(seq.start, seq.length, hintIndex, newHints, gridSize)) {
          possibleHintIndices.push(hintIndex);
        }
      }

      // Disambiguate: when there are filled blocks before us, they must match earlier hints.
      // When there are none, we can still rule out hint k if our start is before the minimum
      // start for hint k (e.g. start=1 with hints [1,1] → we can't be hint 1, so we're hint 0).
      const precedingBlocks = this.findSequences(cells.slice(0, seq.start));
      let validIndices: number[];
      if (precedingBlocks.length === 0) {
        // No blocks before us: we can only be hint k if there is room for hints 0..k-1 plus a gap.
        // So hint k's minimum start is minSpaceForHints(0..k-1) + 1 (gap). At start=1 with [1,1], we can't be hint 1.
        validIndices = possibleHintIndices.filter((hintIndex) => {
          if (hintIndex === 0) return true;
          const minStart = this.minSpaceForHints(newHints, 0, hintIndex - 1) + 1;
          return seq.start >= minStart;
        });
      } else {
        validIndices = possibleHintIndices.filter((hintIndex) =>
          this.precedingCellsMatchHints(cells, seq.start, newHints, hintIndex)
        );
      }

      // Mark only when we can determine which hint this block is:
      // (1) uniquely by room/preceding (validIndices.length === 1), or
      // (2) pinned to an edge: no empty cells to one side, so we know we're the Nth block (N = precedingBlocks.length).
      let hintIndexToMark: number | null = null;
      if (validIndices.length === 1) {
        hintIndexToMark = validIndices[0];
      } else {
        const noEmptyLeft = seq.start === 0 || !cells.slice(0, seq.start).some((c) => c === CellState.EMPTY);
        const noEmptyRight =
          seq.start + seq.length >= gridSize ||
          !cells.slice(seq.start + seq.length).some((c) => c === CellState.EMPTY);
        if (noEmptyLeft || noEmptyRight) {
          const pinnedHintIndex = precedingBlocks.length;
          if (pinnedHintIndex < newHints.length && validIndices.includes(pinnedHintIndex)) {
            hintIndexToMark = pinnedHintIndex;
          }
        }
      }
      if (hintIndexToMark != null && !newHints[hintIndexToMark].used) {
        const answerSequence = answerSequences[hintIndexToMark] as { start: number; length: number } | undefined;
        if (
          answerSequence != null &&
          seq.start === answerSequence.start &&
          seq.length === answerSequence.length
        ) {
          newHints[hintIndexToMark].used = true;
        }
      }
    }

    return newHints;
  }
}

/** Convenience export for the singleton instance */
export const hintChecker = HintChecker.getInstance();
