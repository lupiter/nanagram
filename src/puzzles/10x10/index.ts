import puzzle1 from './puzzle1.json';
import puzzle2 from './puzzle2.json';
import puzzle3 from './puzzle3.json';
import puzzle4 from './puzzle4.json';
import puzzle5 from './puzzle5.json';
import puzzle6 from './puzzle6.json';

import { PuzzleDefinition } from '../../types/nonogram';

const puzzles = [puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6] as PuzzleDefinition[];

export default puzzles.sort((a, b) => a.difficulty - b.difficulty);
