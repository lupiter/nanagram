import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { puzzleLibrary } from "../../services/PuzzleLibrary";
import { puzzleCodec } from "../../services/PuzzleCodec";
import { usePuzzleGame } from "../../hooks/usePuzzleGame";
import { usePageTitle } from "../../hooks/usePageTitle";
import PuzzlePlayer from "../../components/PuzzlePlayer/PuzzlePlayer";
import DifficultyStars from "../../components/DifficultyStars/DifficultyStars";

/**
 * Unified puzzle playing page.
 * Handles both built-in puzzles (/puzzle/:category/:id) and 
 * URL-encoded puzzles (/play/:encoded).
 */
export default function Puzzle() {
  const { category, id, encoded } = useParams<{ 
    category?: string; 
    id?: string; 
    encoded?: string;
  }>();
  
  const { setTitle } = usePageTitle();

  // Determine puzzle source and load puzzle data
  const { puzzle, puzzleKey, source } = useMemo(() => {
    // Built-in puzzle from library
    if (category && id) {
      const libraryPuzzle = puzzleLibrary.getPuzzle(category, id);
      return {
        puzzle: libraryPuzzle,
        puzzleKey: `${category}-${id}`,
        source: "library" as const,
      };
    }
    
    // URL-encoded puzzle
    if (encoded) {
      try {
        const { name, solution, difficulty } = puzzleCodec.decode(encoded);
        const height = solution.length;
        const width = solution[0]?.length ?? 0;
        const decodedPuzzle: PuzzleDefinition = { name, height, width, solution, difficulty };
        return {
          puzzle: decodedPuzzle,
          puzzleKey: `play-${encoded.slice(0, 16)}`,
          source: "encoded" as const,
        };
      } catch {
        return {
          puzzle: null,
          puzzleKey: "invalid",
          source: "encoded" as const,
        };
      }
    }

    return {
      puzzle: null,
      puzzleKey: "invalid",
      source: "unknown" as const,
    };
  }, [category, id, encoded]);

  // Get next puzzle (only for library puzzles)
  const nextPuzzle = useMemo(() => {
    if (source === "library" && category && id) {
      return puzzleLibrary.getNextPuzzle(category, id);
    }
    return undefined;
  }, [source, category, id]);

  // For random (encoded) puzzles, pass size and difficulty so win screen can offer "Another puzzle"
  const randomAgainParams = useMemo(() => {
    if (source === "encoded" && puzzle?.name === "Random" && puzzle) {
      return {
        width: puzzle.width,
        height: puzzle.height,
        difficulty: puzzle.difficulty,
      };
    }
    return null;
  }, [source, puzzle]);

  // For library puzzles, use the original id for completion tracking
  // For encoded puzzles, use the puzzleKey (which includes a hash of the encoded data)
  const trackingId = source === "library" && id ? id : puzzleKey;
  
  const { state, setState, controller, dragJustEndedCellsRef } = usePuzzleGame({
    category: category ?? "play",
    id: trackingId,
    puzzle: puzzle ?? { name: "Invalid", height: 1, width: 1, difficulty: 0, solution: [[CellState.EMPTY]] },
  });

  // Set page title with difficulty
  useEffect(() => {
    if (!puzzle) {
      document.title = "Invalid Puzzle - Nanagram";
      setTitle({ title: "Invalid Puzzle" });
      return;
    }

    const size = `${String(puzzle.height)}×${String(puzzle.width)}`;
    
    // Build subtitle with size and difficulty
    const subtitle = (
      <>
        {size}
        {puzzle.difficulty > 0 && (
          <>
            {" · "}
            <DifficultyStars difficulty={puzzle.difficulty} size="small" />
          </>
        )}
      </>
    );

    if (source === "library" && id) {
      document.title = `${category ?? ""} #${id} - Nanagram`;
      setTitle({ title: `Puzzle ${id}`, subtitle });
    } else {
      const title = puzzle.name === "Random" ? "Random Puzzle" : "Shared Puzzle";
      document.title = `${title} - Nanagram`;
      setTitle({ title, subtitle });
    }
  }, [puzzle, source, category, id, setTitle]);

  return (
    <PuzzlePlayer
      puzzle={puzzle}
      state={state}
      setState={setState}
      controller={controller}
      nextPuzzle={nextPuzzle}
      randomAgainParams={randomAgainParams}
      dragJustEndedCellsRef={dragJustEndedCellsRef}
    />
  );
}
