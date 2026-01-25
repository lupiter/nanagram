/**
 * Types for Sketch, Share, Solve (SSS) file format
 * 
 * SSS is a format for storing 10x15 puzzles with profile and puzzle collections.
 */

/** SSS Profile - represents a user/creator */
export interface SSSProfile {
  id: string;
  name: string;
  avatar: string;  // 100 chars: 10x10 grid as binary string
  created: string[];  // Puzzle IDs created by this profile
  createdOn: string;  // ISO date string
}

/** SSS Puzzle - represents a single puzzle */
export interface SSSPuzzle {
  id: string;
  title: string;
  grid: string;  // 150 chars: 10x15 grid as binary string
}

/** Full SSS File format */
export interface SSSFile {
  profileList: string[];
  profiles: Record<string, SSSProfile>;
  puzzles: Record<string, SSSPuzzle>;
}

/** Puzzle with creator info */
export interface SSSPuzzleWithCreator {
  puzzle: SSSPuzzle;
  creator: SSSProfile | null;
}

/** Result of adding multiple puzzles */
export interface AddPuzzlesResult {
  file: SSSFile;
  added: number;
  skipped: number;
}
