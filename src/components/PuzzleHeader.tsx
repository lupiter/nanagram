import { Link } from "react-router-dom";

interface PuzzleHeaderProps {
  category: string;
  id: string;
  prevPuzzle: { category: string; id: string } | null;
  nextPuzzle: { category: string; id: string } | null;
}

export default function PuzzleHeader({ category, id, prevPuzzle, nextPuzzle }: PuzzleHeaderProps) {
  return (
    <div className="puzzle-header">
      <div className="puzzle-nav">
        {prevPuzzle ? (
          <Link
            to={`/puzzle/${prevPuzzle.category}/${prevPuzzle.id}`}
            className="nav-button"
            aria-label="Previous puzzle"
          >
            ← Prev
          </Link>
        ) : (
          <span className="nav-button disabled">← Prev</span>
        )}
        <h2>
          Puzzle {id} <span className="category-label">({category})</span>
        </h2>
        {nextPuzzle ? (
          <Link
            to={`/puzzle/${nextPuzzle.category}/${nextPuzzle.id}`}
            className="nav-button"
            aria-label="Next puzzle"
          >
            Next →
          </Link>
        ) : (
          <span className="nav-button disabled">Next →</span>
        )}
      </div>
    </div>
  );
}

