import puzzle1 from './puzzle1.json';
import puzzle2 from './puzzle2.json';

import { PuzzleDefinition } from '../../types/nonogram';

const puzzles = [puzzle1, puzzle2] as PuzzleDefinition[];

export default puzzles.sort((a, b) => a.difficulty - b.difficulty);
