interface PuzzleHeaderProps {
  category: string;
  id: string; 
}

export default function PuzzleHeader({ category, id }: PuzzleHeaderProps) {
  return (
    <div className="puzzle-header">
      <div className="puzzle-nav">
        <h2>
          Puzzle {id} <span className="category-label">({category})</span>
        </h2>
      </div>
    </div>
  );
}

