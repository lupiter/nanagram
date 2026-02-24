#!/usr/bin/env npx tsx
/**
 * Decode a puzzle from a URL path segment and print as JSON.
 * Usage: npx tsx scripts/decode-puzzle-url.ts <encoded>
 */
import { puzzleCodec } from '../src/services/PuzzleCodec';

const encoded = process.argv[2] ?? '';
if (!encoded) {
  console.error('Usage: npx tsx scripts/decode-puzzle-url.ts <encoded>');
  process.exit(1);
}

const decoded = puzzleCodec.decode(encoded);
const puzzle = {
  name: decoded.name,
  height: decoded.solution.length,
  width: decoded.solution[0]?.length ?? 0,
  difficulty: decoded.difficulty,
  solution: decoded.solution,
};
console.log(JSON.stringify(puzzle, null, 2));
