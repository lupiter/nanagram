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

  const { state, setState, controller } = usePuzzleGame({
    category: category ?? "play",
    id: puzzleKey,
    puzzle: puzzle ?? { name: "Invalid", height: 1, width: 1, difficulty: 0, solution: [[CellState.EMPTY]] },
  });

  // Set page title with difficulty
  useEffect(() => {
    if (!puzzle) {
      document.title = "Invalid Puzzle - Nanna Gram";
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
      document.title = `${category ?? ""} #${id} - Nanna Gram`;
      setTitle({ title: `Puzzle ${id}`, subtitle });
    } else {
      const title = puzzle.name === "Random" ? "Random Puzzle" : "Shared Puzzle";
      document.title = `${title} - Nanna Gram`;
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
    />
  );
}
