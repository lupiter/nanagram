#!/usr/bin/env npx tsx

/**
 * Analyze difficulty ratings for existing puzzles
 * Compares handwritten difficulty values against the new algorithm's estimates
 */

import * as fs from 'fs';
import * as path from 'path';
import { PuzzleSolutionData, CellState } from '../src/types/nonogram';
import { analyzeDifficulty, DifficultyMetrics } from '../src/utils/difficultyAnalyzer';

interface PuzzleFile {
  name: string;
  difficulty: number;
  solution: number[][];
}

function analyzePuzzle(filePath: string): { 
  name: string; 
  yours: number; 
  algo: number; 
  metrics: DifficultyMetrics;
  relativePath: string;
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const puzzle: PuzzleFile = JSON.parse(content);
  
  const grid = puzzle.solution.map(row => 
    row.map(cell => cell === 1 ? CellState.FILLED : CellState.EMPTY)
  ) as PuzzleSolutionData;
  
  const metrics = analyzeDifficulty(grid);
  const relativePath = path.relative(process.cwd(), filePath);
  
  return {
    name: puzzle.name,
    yours: puzzle.difficulty,
    algo: metrics.difficulty,
    metrics,
    relativePath,
  };
}

// Find all puzzle files
const puzzleDirs = ['src/puzzles/5x5', 'src/puzzles/10x10', 'src/puzzles/15x15', 'src/puzzles/20x20'];

console.log('🧩 Difficulty Analysis - Comparing Your Ratings vs New Algorithm\n');
console.log('The new algorithm analyzes:');
console.log('  • First pass progress - How many cells solved in first iteration');
console.log('  • Total iterations - How many passes the solver needs');
console.log('  • Initial forced cells - Cells immediately determinable from single lines');
console.log('  • Possibility space - Average possibilities per line\n');
console.log('='.repeat(140));
console.log(
  `${'File'.padEnd(35)} | ${'Name'.padEnd(15)} | You | Algo | Δ  | ` +
  `1st Pass | Iters | Forced | Avg Poss`
);
console.log('='.repeat(140));

const results: ReturnType<typeof analyzePuzzle>[] = [];

for (const dir of puzzleDirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();
  
  for (const file of files) {
    const result = analyzePuzzle(path.join(dir, file));
    results.push(result);
    
    const diff = result.algo - result.yours;
    const diffStr = diff === 0 ? '=' : (diff > 0 ? `+${diff}` : `${diff}`);
    const m = result.metrics;
    
    console.log(
      `${result.relativePath.padEnd(35)} | ` +
      `${result.name.padEnd(15).slice(0, 15)} | ` +
      `${result.yours.toString().padStart(3)} | ` +
      `${result.algo.toString().padStart(4)} | ` +
      `${diffStr.padStart(2)} | ` +
      `${m.firstPassPercent.toFixed(0).padStart(6)}% | ` +
      `${m.iterations.toString().padStart(5)} | ` +
      `${m.initialForcedCells.toString().padStart(6)} | ` +
      `${m.avgPossibilities.toFixed(1).padStart(8)}`
    );
  }
  console.log('-'.repeat(140));
}

// Summary statistics
console.log('\n📊 Summary:\n');

let totalDiff = 0;
let matches = 0;
const diffCounts: Record<number, number> = { '-4': 0, '-3': 0, '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 };

for (const r of results) {
  const diff = r.algo - r.yours;
  totalDiff += Math.abs(diff);
  if (diff === 0) matches++;
  const key = Math.max(-4, Math.min(4, diff)).toString();
  diffCounts[key] = (diffCounts[key] || 0) + 1;
}

console.log(`  Exact matches: ${matches}/${results.length} (${((matches/results.length)*100).toFixed(0)}%)`);
console.log(`  Average absolute difference: ${(totalDiff/results.length).toFixed(2)}`);

console.log('\n  Difference distribution:');
for (let d = -4; d <= 4; d++) {
  const count = diffCounts[d.toString()] || 0;
  if (count > 0) {
    const bar = '█'.repeat(count);
    const label = d === 0 ? ' 0 (match)' : (d > 0 ? `+${d} (algo higher)` : `${d} (algo lower)`);
    console.log(`    ${label.padEnd(18)}: ${bar} ${count}`);
  }
}

// Show which puzzles are most off
const sorted = [...results].sort((a, b) => Math.abs(b.algo - b.yours) - Math.abs(a.algo - a.yours));
const mostOff = sorted.filter(r => Math.abs(r.algo - r.yours) >= 2).slice(0, 5);

if (mostOff.length > 0) {
  console.log('\n  Biggest discrepancies:');
  for (const r of mostOff) {
    const diff = r.algo - r.yours;
    console.log(`    ${r.relativePath}: You=${r.yours}, Algo=${r.algo} (${diff > 0 ? '+' : ''}${diff})`);
  }
}
