import { CellState, PuzzleSolutionData, SolutionCell } from "../types/nonogram";

// Simple XOR key for name obfuscation (not security, just for fun)
const XOR_KEY = [0x4e, 0x6f, 0x6e, 0x6f, 0x67, 0x72, 0x61, 0x6d]; // "Nonogram"

function xorObfuscate(bytes: Uint8Array): Uint8Array {
  const result = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ XOR_KEY[i % XOR_KEY.length];
  }
  return result;
}

function packGridToBits(grid: PuzzleSolutionData): Uint8Array {
  const size = grid.length;
  const totalCells = size * size;
  const byteCount = Math.ceil(totalCells / 8);
  const bytes = new Uint8Array(byteCount);

  let bitIndex = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
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

function unpackBitsToGrid(bytes: Uint8Array, size: number): PuzzleSolutionData {
  const grid: PuzzleSolutionData = [];

  let bitIndex = 0;
  for (let row = 0; row < size; row++) {
    const gridRow: SolutionCell[] = [];
    for (let col = 0; col < size; col++) {
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

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  const base64 = btoa(binary);
  // Convert to base64url: replace + with -, / with _, remove =
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
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

/**
 * Encode a puzzle into a URL-safe string
 * Format: [size:1][difficulty:1][nameLen:2][name:XOR'd UTF-8][grid:bit-packed]
 */
export function encodePuzzle(name: string, solution: PuzzleSolutionData, difficulty = 0): string {
  const size = solution.length;
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(name);
  const obfuscatedName = xorObfuscate(nameBytes);
  const gridBytes = packGridToBits(solution);

  // Build the byte array
  const totalLength = 1 + 1 + 2 + obfuscatedName.length + gridBytes.length;
  const bytes = new Uint8Array(totalLength);

  let offset = 0;

  // Size (1 byte)
  bytes[offset++] = size;

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

  return toBase64Url(bytes);
}

/**
 * Decode a puzzle from a URL-safe string
 * Supports both old format (no difficulty) and new format (with difficulty)
 */
export function decodePuzzle(encoded: string): { name: string; solution: PuzzleSolutionData; difficulty: number } {
  const bytes = fromBase64Url(encoded);

  let offset = 0;

  // Size (1 byte)
  const size = bytes[offset++];

  // Check if this is the new format with difficulty
  // We can detect this by checking if the next byte is a valid difficulty (0-5)
  // and if the name length that follows makes sense
  const possibleDifficulty = bytes[offset];
  const possibleNameLenOld = bytes[offset] | (bytes[offset + 1] << 8);
  const possibleNameLenNew = bytes[offset + 1] | (bytes[offset + 2] << 8);
  
  // Heuristic: if possibleDifficulty is 0-5 and the new format name length is reasonable
  // (less than the remaining bytes), use new format
  const remainingBytesNew = bytes.length - 4 - Math.ceil(size * size / 8);
  
  let difficulty = 0;
  let nameLen: number;
  
  if (possibleDifficulty <= 5 && possibleNameLenNew <= remainingBytesNew && possibleNameLenNew >= 0) {
    // New format with difficulty
    difficulty = bytes[offset++];
    nameLen = bytes[offset] | (bytes[offset + 1] << 8);
    offset += 2;
  } else {
    // Old format without difficulty
    nameLen = possibleNameLenOld;
    offset += 2;
  }

  // Obfuscated name
  const obfuscatedName = bytes.slice(offset, offset + nameLen);
  const nameBytes = xorObfuscate(obfuscatedName);
  const decoder = new TextDecoder();
  const name = decoder.decode(nameBytes);
  offset += nameLen;

  // Grid data
  const gridBytes = bytes.slice(offset);
  const solution = unpackBitsToGrid(gridBytes, size);

  return { name, solution, difficulty };
}

