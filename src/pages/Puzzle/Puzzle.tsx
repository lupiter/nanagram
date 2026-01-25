import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { puzzleLibrary } from "../../services/PuzzleLibrary";
import { usePuzzleGame } from "../../hooks/usePuzzleGame";
import { usePageTitle } from "../../hooks/usePageTitle";
import PuzzlePlayer from "../../components/PuzzlePlayer/PuzzlePlayer";

export default function Puzzle() {
  const { category, id } = useParams() as { category: string; id: string };
  const puzzle = puzzleLibrary.getPuzzle(category, id);
  const { state, setState, controller } = usePuzzleGame({
    category,
    id,
    puzzle,
  });

  const nextPuzzle = puzzleLibrary.getNextPuzzle(category, id);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    document.title = `${category} #${id} - Nanna Gram`;
    setTitle({ title: `Puzzle ${id}`, subtitle: category });
  }, [category, id, setTitle]);

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
