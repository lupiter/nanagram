#!/usr/bin/env npx tsx

/**
 * Puzzle Validation Script
 * 
 * Usage: npx tsx scripts/validate-puzzle.ts <path-to-puzzle.json>
 * 
 * Validates that a puzzle JSON file:
 * - Has valid JSON structure with required fields (name, difficulty, solution)
 * - Has a valid solution grid (rectangular, only 0s and 1s)
 * - Has a unique solution (solvable from hints alone)
 */

import * as fs from 'fs';
import * as path from 'path';

// Import types and utilities
import { PuzzleDefinition, CellState, PuzzleSolutionData } from '../src/types/nonogram';
import { deriveRowHints, deriveColumnHints } from '../src/utils/puzzleUtils';
import { NonogramSolver } from '../src/utils/nonogramSolver';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validatePuzzleFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  // Read and parse JSON
  let puzzleData: unknown;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    puzzleData = JSON.parse(fileContent);
  } catch (e) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  // Validate structure
  if (typeof puzzleData !== 'object' || puzzleData === null) {
    result.valid = false;
    result.errors.push('Puzzle must be a JSON object');
    return result;
  }

  const puzzle = puzzleData as Record<string, unknown>;

  // Check required fields
  if (!('name' in puzzle)) {
    result.valid = false;
    result.errors.push('Missing required field: "name"');
  } else if (typeof puzzle.name !== 'string') {
    result.valid = false;
    result.errors.push('"name" must be a string');
  } else if (puzzle.name.trim() === '') {
    result.warnings.push('"name" is empty');
  }

  if (!('difficulty' in puzzle)) {
    result.valid = false;
    result.errors.push('Missing required field: "difficulty"');
  } else if (typeof puzzle.difficulty !== 'number') {
    result.valid = false;
    result.errors.push('"difficulty" must be a number');
  } else if (!Number.isInteger(puzzle.difficulty) || puzzle.difficulty < 1 || puzzle.difficulty > 5) {
    result.valid = false;
    result.errors.push('"difficulty" must be an integer between 1 and 5');
  }

  if (!('solution' in puzzle)) {
    result.valid = false;
    result.errors.push('Missing required field: "solution"');
    return result;
  }

  // Validate solution grid
  const solution = puzzle.solution;
  
  if (!Array.isArray(solution)) {
    result.valid = false;
    result.errors.push('"solution" must be a 2D array');
    return result;
  }

  if (solution.length === 0) {
    result.valid = false;
    result.errors.push('"solution" cannot be empty');
    return result;
  }

  const height = solution.length;
  const width = Array.isArray(solution[0]) ? solution[0].length : 0;

  if (width === 0) {
    result.valid = false;
    result.errors.push('Solution rows cannot be empty');
    return result;
  }

  // Check all rows have same width and contain only 0s and 1s
  for (let i = 0; i < height; i++) {
    const row = solution[i];
    
    if (!Array.isArray(row)) {
      result.valid = false;
      result.errors.push(`Row ${i} is not an array`);
      continue;
    }

    if (row.length !== width) {
      result.valid = false;
      result.errors.push(`Row ${i} has ${row.length} cells, expected ${width}`);
      continue;
    }

    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell !== 0 && cell !== 1) {
        result.valid = false;
        result.errors.push(`Invalid cell value at [${i}][${j}]: ${cell} (must be 0 or 1)`);
      }
    }
  }

  if (!result.valid) {
    return result;
  }

  // Check if puzzle has at least one filled cell
  const hasFilledCell = solution.some((row: number[]) => row.some((cell: number) => cell === 1));
  if (!hasFilledCell) {
    result.warnings.push('Solution has no filled cells');
  }

  // Check for unique solution
  console.log(`\n📐 Puzzle dimensions: ${width}x${height}`);
  console.log('🔍 Checking for unique solution...');
  
  const solutionData = solution as PuzzleSolutionData;
  const rowHints = deriveRowHints(solutionData).map(row => row.map(h => h.hint));
  const columnHints = deriveColumnHints(solutionData).map(col => col.map(h => h.hint));

  const solver = new NonogramSolver(rowHints, columnHints);
  solver.solve();
  
  // Compare solved board with original solution
  const solvedBoard = solver.board;
  let matches = true;
  
  for (let i = 0; i < height && matches; i++) {
    for (let j = 0; j < width && matches; j++) {
      const expected = solutionData[i][j];
      const solved = solvedBoard[i][j] === 1 ? CellState.FILLED : CellState.EMPTY;
      if (expected !== solved) {
        matches = false;
      }
    }
  }

  if (!matches) {
    result.valid = false;
    result.errors.push('Puzzle does not have a unique solution! The solver found a different valid solution.');
    
    console.log('\n📋 Expected solution:');
    displayGrid(solutionData);
    console.log('\n📋 Solver found:');
    displaySolverBoard(solvedBoard);
  } else {
    console.log('✅ Puzzle has a unique solution');
  }

  return result;
}

function displayGrid(grid: PuzzleSolutionData): void {
  for (const row of grid) {
    console.log('  ' + row.map(cell => cell === CellState.FILLED ? '█' : '·').join(''));
  }
}

function displaySolverBoard(board: number[][]): void {
  for (const row of board) {
    console.log('  ' + row.map(cell => cell === 1 ? '█' : cell === -1 ? '·' : '?').join(''));
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: npx tsx scripts/validate-puzzle.ts <path-to-puzzle.json>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/validate-puzzle.ts src/puzzles/5x5/puzzle1.json');
  process.exit(1);
}

const filePath = path.resolve(args[0]);
console.log(`\n🧩 Validating puzzle: ${filePath}`);

const result = validatePuzzleFile(filePath);

if (result.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  for (const warning of result.warnings) {
    console.log(`   - ${warning}`);
  }
}

if (result.errors.length > 0) {
  console.log('\n❌ Errors:');
  for (const error of result.errors) {
    console.log(`   - ${error}`);
  }
}

if (result.valid) {
  console.log('\n✅ Puzzle is valid!\n');
  process.exit(0);
} else {
  console.log('\n❌ Puzzle validation failed!\n');
  process.exit(1);
}
