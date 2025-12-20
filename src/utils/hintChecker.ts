import { CellState, Hint } from "../types/nonogram";

export function checkHints(
  cells: CellState[],
  hints: Hint[],
  answerCells: CellState[]
): Hint[] {
  const newHints = [...hints];
  
  // Find all sequences of filled cells in both the answer and current state
  const findSequences = (cells: CellState[]) => {
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
  };
  
  const answerSequences = findSequences(answerCells);
  const currentSequences = findSequences(cells);
  
  // For each hint, check if its corresponding sequence in the answer is filled correctly
  for (let hintIndex = 0; hintIndex < newHints.length; hintIndex++) {
    const hint = newHints[hintIndex];
    if (hint.used) continue; // Skip if already used
    
    // Find the corresponding sequence in the answer for this hint
    const answerSequence = answerSequences[hintIndex];
    if (!answerSequence) continue;
    
    // Find a matching sequence in the current state
    hint.used = currentSequences.some(seq => 
      seq.start === answerSequence.start && seq.length === hint.hint
    );
  }

  return newHints;
} 