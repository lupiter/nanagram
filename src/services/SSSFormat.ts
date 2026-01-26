/**
 * SSSFormat - Handles Sketch, Share, Solve file format operations
 * 
 * SSS is a format for storing 10x15 puzzles with profile and puzzle collections.
 * Grid format: 150 characters (10 rows × 15 columns) of '0' and '1'
 */

import {
  SSSProfile,
  SSSPuzzle,
  SSSFile,
  SSSPuzzleWithCreator,
  AddPuzzlesResult,
} from "../types/sss";
import { CellState } from "../types/nonogram";

// Re-export types for convenience
export type { SSSProfile, SSSPuzzle, SSSFile, SSSPuzzleWithCreator, AddPuzzlesResult };

export class SSSFormat {
  private static instance: SSSFormat;

  /** SSS puzzles are always 10x15 */
  readonly height = 10;
  readonly width = 15;
  readonly gridSize = 150;  // 10 * 15

  /** Get the singleton instance */
  static getInstance(): SSSFormat {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    SSSFormat.instance ??= new SSSFormat();
    return SSSFormat.instance;
  }

  /** Generate a random 16-character ID */
  generateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  /** Convert a 2D grid to SSS grid string (binary string of 0s and 1s) */
  gridToString(grid: number[][]): string {
    return grid.map(row => row.map(cell => cell === 1 ? '1' : '0').join('')).join('');
  }

  /** Convert an SSS grid string to a 2D grid */
  stringToGrid(gridString: string): number[][] {
    const grid: number[][] = [];
    for (let row = 0; row < this.height; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < this.width; col++) {
        const char = gridString[row * this.width + col];
        rowData.push(char === '1' ? 1 : 0);
      }
      grid.push(rowData);
    }
    return grid;
  }

  /** Create an empty SSS file */
  createEmptyFile(): SSSFile {
    return {
      profileList: [],
      profiles: {},
      puzzles: {},
    };
  }

  /** Find or create a profile in an SSS file, returning updated file and profile ID */
  private ensureProfile(file: SSSFile, profileName: string): { file: SSSFile; profileId: string } {
    let profileId: string | undefined = file.profileList.find(id => file.profiles[id].name === profileName);

    if (!profileId) {
      profileId = this.generateId();
      const newProfile: SSSProfile = {
        id: profileId,
        name: profileName,
        avatar: '0'.repeat(100), // Empty 10x10 avatar
        created: [],
        createdOn: new Date().toISOString().split('T')[0],
      };
      file = {
        ...file,
        profileList: [...file.profileList, profileId],
        profiles: { ...file.profiles, [profileId]: newProfile },
      };
    }

    return { file, profileId };
  }

  /** Add a puzzle to an SSS file */
  addPuzzle(
    file: SSSFile,
    puzzle: { title: string; grid: number[][] },
    profileName: string
  ): SSSFile {
    const puzzleId = this.generateId();
    const gridString = this.gridToString(puzzle.grid);

    // Find or create profile
    const { file: updatedFile, profileId } = this.ensureProfile(file, profileName);
    file = updatedFile;

    // Add puzzle
    const newPuzzle: SSSPuzzle = {
      id: puzzleId,
      title: puzzle.title,
      grid: gridString,
    };

    // Update profile with new puzzle
    const profile = file.profiles[profileId];
    const updatedProfile: SSSProfile = {
      ...profile,
      created: [...profile.created, puzzleId],
    };

    return {
      ...file,
      profiles: { ...file.profiles, [profileId]: updatedProfile },
      puzzles: { ...file.puzzles, [puzzleId]: newPuzzle },
    };
  }

  /** Add multiple puzzles to an SSS file with optional deduplication */
  addPuzzles(
    file: SSSFile,
    puzzles: { title: string; grid: (number | CellState)[][] }[],
    profileName: string,
    deduplicate = true
  ): AddPuzzlesResult {
    let result = { ...file };
    let added = 0;
    let skipped = 0;

    for (const puzzle of puzzles) {
      const gridString = this.gridToString(puzzle.grid);

      if (deduplicate && this.findDuplicatePuzzle(result, gridString)) {
        skipped++;
        continue;
      }

      result = this.addPuzzle(result, puzzle, profileName);
      added++;
    }

    return { file: result, added, skipped };
  }

  /** Get all puzzles from an SSS file with creator info */
  getAllPuzzles(file: SSSFile): SSSPuzzleWithCreator[] {
    const puzzles: SSSPuzzleWithCreator[] = [];

    for (const puzzleId of Object.keys(file.puzzles)) {
      const puzzle = file.puzzles[puzzleId];
      // Find the creator
      let creator: SSSProfile | null = null;
      for (const profileId of file.profileList) {
        const profile = file.profiles[profileId];
        if (profile.created.includes(puzzleId)) {
          creator = profile;
          break;
        }
      }
      puzzles.push({ puzzle, creator });
    }

    return puzzles;
  }

  /** Check if a puzzle grid already exists in an SSS file */
  findDuplicatePuzzle(file: SSSFile, gridString: string): SSSPuzzle | null {
    for (const puzzleId of Object.keys(file.puzzles)) {
      if (file.puzzles[puzzleId].grid === gridString) {
        return file.puzzles[puzzleId];
      }
    }
    return null;
  }

  /** Validate an SSS file structure */
  validate(data: unknown): data is SSSFile {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    if (!Array.isArray(obj.profileList)) return false;
    if (typeof obj.profiles !== 'object' || obj.profiles === null) return false;
    if (typeof obj.puzzles !== 'object' || obj.puzzles === null) return false;

    // Validate puzzles have required fields
    const puzzles = obj.puzzles as Record<string, unknown>;
    for (const key of Object.keys(puzzles)) {
      const puzzle = puzzles[key] as Record<string, unknown>;
      if (typeof puzzle.id !== 'string') return false;
      if (typeof puzzle.title !== 'string') return false;
      if (typeof puzzle.grid !== 'string') return false;
      // SSS puzzles are 10x15, so grid should be 150 chars
      if (puzzle.grid.length !== this.gridSize) return false;
    }

    return true;
  }

  /** Parse an SSS file from JSON string */
  parse(jsonString: string): SSSFile | null {
    try {
      const data = JSON.parse(jsonString) as unknown;
      if (this.validate(data)) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Download an SSS file */
  download(file: SSSFile, filename: string): void {
    const json = JSON.stringify(file, null, '\t');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/** Convenience export for the singleton instance */
export const sssFormat = SSSFormat.getInstance();
