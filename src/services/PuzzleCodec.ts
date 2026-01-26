/**
 * PuzzleCodec - Encodes and decodes puzzles to/from URL-safe strings
 * 
 * Format: [height:1][width:1][difficulty:1][nameLen:2][name:XOR'd UTF-8][grid:bit-packed]
 */

import { CellState, PuzzleSolutionData, SolutionCell } from "../types/nonogram";
import { DecodedPuzzle } from "../types/puzzle";

// Re-export types for convenience
export type { DecodedPuzzle };

export class PuzzleCodec {
  private static instance: PuzzleCodec;

  // Simple XOR key for name obfuscation (not security, just for fun)
  private readonly xorKey = [0x4e, 0x6f, 0x6e, 0x6f, 0x67, 0x72, 0x61, 0x6d]; // "Nonogram"

  /** Get the singleton instance */
  static getInstance(): PuzzleCodec {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    PuzzleCodec.instance ??= new PuzzleCodec();
    return PuzzleCodec.instance;
  }

  /** XOR obfuscate/deobfuscate bytes */
  private xorObfuscate(bytes: Uint8Array): Uint8Array {
    const result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ this.xorKey[i % this.xorKey.length];
    }
    return result;
  }

  /** Pack a 2D grid into bit-packed bytes */
  private packGridToBits(grid: PuzzleSolutionData): Uint8Array {
    const height = grid.length;
    const width = grid[0]?.length ?? 0;
    const totalCells = height * width;
    const byteCount = Math.ceil(totalCells / 8);
    const bytes = new Uint8Array(byteCount);

    let bitIndex = 0;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (grid[row][col] === CellState.FILLED) {
          const bytePos = Math.floor(bitIndex / 8);
          const bitPos = 7 - (bitIndex % 8); // MSB first
          bytes[bytePos] |= 1 << bitPos;
        }
        bitIndex++;
      }
    }

    return bytes;
  }

  /** Unpack bit-packed bytes into a 2D grid */
  private unpackBitsToGrid(bytes: Uint8Array, height: number, width: number): PuzzleSolutionData {
    const grid: PuzzleSolutionData = [];

    let bitIndex = 0;
    for (let row = 0; row < height; row++) {
      const gridRow: SolutionCell[] = [];
      for (let col = 0; col < width; col++) {
        const bytePos = Math.floor(bitIndex / 8);
        const bitPos = 7 - (bitIndex % 8);
        const isFilled = (bytes[bytePos] & (1 << bitPos)) !== 0;
        gridRow.push(isFilled ? CellState.FILLED : CellState.EMPTY);
        bitIndex++;
      }
      grid.push(gridRow);
    }

    return grid;
  }

  /** Convert bytes to base64url string */
  private toBase64Url(bytes: Uint8Array): string {
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join("");
    const base64 = btoa(binary);
    // Convert to base64url: replace + with -, / with _, remove =
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /** Convert base64url string to bytes */
  private fromBase64Url(str: string): Uint8Array {
    // Restore standard base64
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /** Encode a puzzle into a URL-safe string */
  encode(name: string, solution: PuzzleSolutionData, difficulty = 0): string {
    const height = solution.length;
    const width = solution[0]?.length ?? 0;
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode(name);
    const obfuscatedName = this.xorObfuscate(nameBytes);
    const gridBytes = this.packGridToBits(solution);

    // Build the byte array: height + width + difficulty + nameLen(2) + name + grid
    const totalLength = 1 + 1 + 1 + 2 + obfuscatedName.length + gridBytes.length;
    const bytes = new Uint8Array(totalLength);

    let offset = 0;

    // Height (1 byte)
    bytes[offset++] = height;

    // Width (1 byte)
    bytes[offset++] = width;

    // Difficulty (1 byte, 0-5)
    bytes[offset++] = Math.min(5, Math.max(0, difficulty));

    // Name length (2 bytes, little-endian)
    bytes[offset++] = obfuscatedName.length & 0xff;
    bytes[offset++] = (obfuscatedName.length >> 8) & 0xff;

    // Obfuscated name
    bytes.set(obfuscatedName, offset);
    offset += obfuscatedName.length;

    // Grid data
    bytes.set(gridBytes, offset);

    return this.toBase64Url(bytes);
  }

  /** Decode a puzzle from a URL-safe string */
  decode(encoded: string): DecodedPuzzle {
    const bytes = this.fromBase64Url(encoded);

    let offset = 0;

    // Height (1 byte)
    const height = bytes[offset++];

    // Width (1 byte)
    const width = bytes[offset++];

    // Difficulty (1 byte, 0-5)
    const difficulty = bytes[offset++];

    // Name length (2 bytes, little-endian)
    const nameLen = bytes[offset] | (bytes[offset + 1] << 8);
    offset += 2;

    // Obfuscated name
    const obfuscatedName = bytes.slice(offset, offset + nameLen);
    const nameBytes = this.xorObfuscate(obfuscatedName);
    const decoder = new TextDecoder();
    const name = decoder.decode(nameBytes);
    offset += nameLen;

    // Grid data
    const gridBytes = bytes.slice(offset);
    const solution = this.unpackBitsToGrid(gridBytes, height, width);

    return { name, solution, difficulty };
  }
}

/** Convenience export for the singleton instance */
export const puzzleCodec = PuzzleCodec.getInstance();
