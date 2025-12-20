# Nonogram 🧩

A web-based nonogram (picross) puzzle game built with React, TypeScript, and Vite.

## What is a Nonogram?

Nonograms are picture logic puzzles where you fill in cells on a grid to reveal a hidden image. Each row and column has number clues indicating the lengths of consecutive filled cell groups.

## Features

- **Multiple puzzle sizes**: 5×5, 10×10, 15×15, and 20×20 grids
- **Two game modes**:
  - **Assisted Mode**: Invalid moves are blocked and marked with an error sound; rows/columns auto-complete when solved
  - **Free Mode**: No assistance — solve the puzzle on your own
- **Intuitive controls**:
  - Left-click to fill/unfill cells
  - Right-click to cross out/uncross cells
  - Toggle between fill (■) and cross (✕) tools
- **Visual hint tracking**: Completed hint numbers are crossed out
- **Victory celebration**: Popup when puzzle is solved
- **Responsive design**: Works on desktop browsers

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nonogram-gb

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── HintDisplay   # Row/column hint numbers
│   ├── Layout        # Page layout with navigation
│   ├── ToggleGroup   # Radio button group for tools/modes
│   └── VictoryPopup  # Win celebration dialog
├── pages/
│   ├── Home          # Puzzle selection menu
│   └── Puzzle        # Main game page
├── puzzles/          # Puzzle data by size
│   ├── 5x5/
│   ├── 10x10/
│   ├── 15x15/
│   └── 20x20/
├── types/            # TypeScript type definitions
└── utils/            # Game logic utilities
    ├── errorSound    # Audio feedback for errors
    ├── hintChecker   # Hint completion logic
    ├── puzzleLoader  # Puzzle data loading
    ├── puzzleUtils   # Core game utilities
    └── updateCell    # Cell update logic
```

## Adding New Puzzles

Puzzles are stored in `src/puzzles/{size}/` directories. Each puzzle is a 2D array where:
- `0` = empty cell (should not be filled)
- `1` = filled cell (part of the solution)

Example 5×5 puzzle (a simple cross pattern):

```typescript
// src/puzzles/5x5/puzzle1.ts
export const puzzle1 = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
];
```

## Known Limitations

- No progress saving (refreshing loses puzzle state)
- No undo/redo functionality
- Single-cell clicks only (no drag-to-fill)
- No timer or scoring system

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **React Router** — Client-side routing
- **Jest** — Testing framework

## License

MIT
