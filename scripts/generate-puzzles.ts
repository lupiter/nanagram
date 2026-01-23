#!/usr/bin/env npx tsx

/**
 * Puzzle Generator Script
 * 
 * Generates random nonogram puzzles of a given size and saves valid ones
 * (puzzles with unique solutions) to files.
 * 
 * Usage: npx tsx scripts/generate-puzzles.ts --puzzles <n> [options]
 * 
 * Required:
 *   --puzzles <n>         Number of valid puzzles to generate (REQUIRED)
 * 
 * Options:
 *   --size <n>            Puzzle size NxN (default: 5, supports 5, 10, 15, 20)
 *   --min-difficulty <n>  Minimum difficulty 1-5 (default: 1)
 *   --output <dir>        Output directory (default: generated-puzzles/{size}x{size})
 *   --dry-run             Don't write files, just count valid puzzles
 */

import * as fs from 'fs';
import * as path from 'path';
import { PuzzleSolutionData, CellState } from '../src/types/nonogram';
import { deriveRowHints, deriveColumnHints } from '../src/utils/puzzleUtils';
import { NonogramSolver } from '../src/utils/nonogramSolver';
import { getDifficultyRating } from '../src/utils/difficultyAnalyzer';

interface Options {
  size: number;
  minDifficulty: number;
  puzzles: number;
  outputDir: string | null;
  dryRun: boolean;
}

function parseArgs(): Options | null {
  const args = process.argv.slice(2);
  
  const options: Options = {
    size: 5,
    minDifficulty: 1,
    puzzles: 0,
    outputDir: null,
    dryRun: false,
  };

  let hasPuzzles = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--size':
        options.size = parseInt(args[++i], 10);
        break;
      case '--min-difficulty':
        options.minDifficulty = parseInt(args[++i], 10);
        break;
      case '--puzzles':
        options.puzzles = parseInt(args[++i], 10);
        hasPuzzles = true;
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  // Validate required arguments
  if (!hasPuzzles) {
    console.error('❌ Error: --puzzles is required');
    console.error('');
    console.error('Usage: npx tsx scripts/generate-puzzles.ts --puzzles <n> [options]');
    console.error('');
    console.error('Required:');
    console.error('  --puzzles <n>         Number of puzzles to generate');
    console.error('');
    console.error('Options:');
    console.error('  --size <n>            Puzzle size NxN (default: 5)');
    console.error('  --min-difficulty <n>  Minimum difficulty 1-5 (default: 1)');
    console.error('  --output <dir>        Output directory');
    console.error('  --dry-run             Count valid puzzles without saving');
    return null;
  }

  // Validate puzzles count
  if (options.puzzles <= 0) {
    console.error('❌ Error: --puzzles must be a positive number');
    return null;
  }

  // Validate size
  const validSizes = [5, 10, 15, 20];
  if (!validSizes.includes(options.size)) {
    console.error(`❌ Error: --size must be one of: ${validSizes.join(', ')}`);
    return null;
  }

  // Validate difficulty
  if (options.minDifficulty < 1 || options.minDifficulty > 5) {
    console.error('❌ Error: --min-difficulty must be between 1 and 5');
    return null;
  }

  // Set default output dir based on size
  if (options.outputDir === null) {
    options.outputDir = `generated-puzzles/${options.size}x${options.size}`;
  }

  return options;
}

function generateRandomGrid(size: number): PuzzleSolutionData {
  const grid: PuzzleSolutionData = [];
  for (let row = 0; row < size; row++) {
    const rowData: (CellState.EMPTY | CellState.FILLED)[] = [];
    for (let col = 0; col < size; col++) {
      // Random fill with ~40-60% probability for interesting puzzles
      const fillProbability = 0.4 + Math.random() * 0.2;
      rowData.push(Math.random() < fillProbability ? CellState.FILLED : CellState.EMPTY);
    }
    grid.push(rowData);
  }
  return grid;
}

function gridToNumber(grid: PuzzleSolutionData, size: number): bigint {
  let n = 0n;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === CellState.FILLED) {
        const bitIndex = BigInt(row * size + col);
        n |= (1n << bitIndex);
      }
    }
  }
  return n;
}

function hasUniqueSolution(solution: PuzzleSolutionData, size: number): boolean {
  const rowHints = deriveRowHints(solution).map(row => row.map(h => h.hint));
  const columnHints = deriveColumnHints(solution).map(col => col.map(h => h.hint));

  const solver = new NonogramSolver(rowHints, columnHints);
  solver.solve();
  
  const solvedBoard = solver.board;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const expected = solution[i][j];
      const solved = solvedBoard[i][j] === 1 ? CellState.FILLED : CellState.EMPTY;
      if (expected !== solved) {
        return false;
      }
    }
  }
  
  return true;
}

// Canonical form for deduplication - smallest numeric value among all 8 transformations
function getCanonicalForm(n: bigint, size: number): bigint {
  const transforms: bigint[] = [n];
  
  // Get all 8 transformations (4 rotations × 2 for reflection)
  let current = n;
  
  // Rotations
  for (let r = 0; r < 3; r++) {
    current = rotate90(current, size);
    transforms.push(current);
  }
  
  // Reflect and rotate
  current = reflect(n, size);
  transforms.push(current);
  for (let r = 0; r < 3; r++) {
    current = rotate90(current, size);
    transforms.push(current);
  }
  
  return transforms.reduce((min, t) => t < min ? t : min);
}

function rotate90(n: bigint, size: number): bigint {
  let result = 0n;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const oldBit = BigInt(row * size + col);
      const newRow = col;
      const newCol = size - 1 - row;
      const newBit = BigInt(newRow * size + newCol);
      if ((n >> oldBit) & 1n) {
        result |= (1n << newBit);
      }
    }
  }
  return result;
}

function reflect(n: bigint, size: number): bigint {
  let result = 0n;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const oldBit = BigInt(row * size + col);
      const newCol = size - 1 - col;
      const newBit = BigInt(row * size + newCol);
      if ((n >> oldBit) & 1n) {
        result |= (1n << newBit);
      }
    }
  }
  return result;
}


async function main() {
  const options = parseArgs();
  
  if (options === null) {
    process.exit(1);
  }
  
  const size = options.size;
  const totalCells = size * size;
  
  console.log(`🧩 ${size}x${size} Random Puzzle Generator`);
  console.log('================================');
  console.log(`Size: ${size}x${size} (${totalCells} cells)`);
  console.log(`Puzzles to generate: ${options.puzzles}`);
  console.log(`Min difficulty: ${options.minDifficulty}`);
  console.log(`Output directory: ${options.outputDir}`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log();

  // Create output directory
  if (!options.dryRun) {
    fs.mkdirSync(options.outputDir!, { recursive: true });
  }

  const seenCanonical = new Set<string>();
  let attempts = 0;
  let skippedDuplicate = 0;
  let skippedDifficulty = 0;
  let invalid = 0;
  let valid = 0;
  
  const startTime = Date.now();
  let lastProgressTime = startTime;

  console.log('🎲 Generating random puzzles...\n');

  // Keep generating until we have enough valid puzzles
  while (valid < options.puzzles) {
    attempts++;
    
    const grid = generateRandomGrid(size);
    const gridNum = gridToNumber(grid, size);
    
    // Check for duplicate (rotation/reflection)
    const canonical = getCanonicalForm(gridNum, size);
    const canonicalStr = canonical.toString();
    if (seenCanonical.has(canonicalStr)) {
      skippedDuplicate++;
      continue;
    }
    seenCanonical.add(canonicalStr);
    
    // Check for unique solution
    if (hasUniqueSolution(grid, size)) {
      const difficulty = getDifficultyRating(grid);
      
      // Filter by minimum difficulty
      if (difficulty < options.minDifficulty) {
        skippedDifficulty++;
        continue;
      }
      
      valid++;
      
      if (!options.dryRun) {
        const puzzleData = {
          name: `Generated ${valid}`,
          difficulty,
          solution: grid.map(row => row.map(c => c === CellState.FILLED ? 1 : 0)),
        };
        
        const fileName = `puzzle_${valid.toString().padStart(5, '0')}.json`;
        const filePath = path.join(options.outputDir!, fileName);
        fs.writeFileSync(filePath, JSON.stringify(puzzleData, null, 2) + '\n');
      }
    } else {
      invalid++;
    }
    
    // Progress report every 5 seconds
    const now = Date.now();
    if (now - lastProgressTime > 5000) {
      const elapsed = (now - startTime) / 1000;
      const rate = valid / elapsed;
      const remaining = options.puzzles - valid;
      const eta = rate > 0 ? remaining / rate : Infinity;
      
      console.log(
        `Progress: ${valid}/${options.puzzles} | ` +
        `Attempts: ${attempts.toLocaleString()} | ` +
        `Invalid: ${invalid} | Dup: ${skippedDuplicate} | Too easy: ${skippedDifficulty} | ` +
        `ETA: ${formatTime(eta)}`
      );
      lastProgressTime = now;
    }
  }

  const elapsed = (Date.now() - startTime) / 1000;
  
  console.log();
  console.log('================================');
  console.log('🏁 Generation Complete!');
  console.log(`Total time: ${formatTime(elapsed)}`);
  console.log(`Attempts: ${attempts.toLocaleString()}`);
  console.log(`Skipped (duplicates): ${skippedDuplicate.toLocaleString()}`);
  console.log(`Skipped (too easy): ${skippedDifficulty.toLocaleString()}`);
  console.log(`Invalid (no unique solution): ${invalid.toLocaleString()}`);
  console.log(`✅ Valid puzzles: ${valid.toLocaleString()}`);
  
  const successRate = ((valid / attempts) * 100).toFixed(1);
  console.log(`Success rate: ${successRate}%`);
  
  if (!options.dryRun && valid > 0) {
    console.log(`\nPuzzles saved to: ${options.outputDir}/`);
  }
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '∞';
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

main().catch(console.error);
