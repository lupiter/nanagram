import puzzle1 from './puzzle1.json';
import puzzle2 from './puzzle2.json';
import puzzle3 from './puzzle3.json';
import puzzle4 from './puzzle4.json';
import puzzle5 from './puzzle5.json';
import puzzle6 from './puzzle6.json';
import puzzle7 from './puzzle7.json';
import puzzle8 from './puzzle8.json';
import puzzle9 from './puzzle9.json';
import puzzle10 from './puzzle10.json';

import { PuzzleDefinition } from '../../types/nonogram';

const puzzles = [puzzle1, puzzle2, puzzle3, puzzle4, puzzle5, puzzle6, puzzle7, puzzle8, puzzle9, puzzle10] as PuzzleDefinition[];

export default puzzles.sort((a, b) => a.difficulty - b.difficulty);
