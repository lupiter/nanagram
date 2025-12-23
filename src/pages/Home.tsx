import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';
import { puzzleMap, getCompletedPuzzles } from '../utils/puzzleLoader';

export default function Home() {
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedPuzzles(getCompletedPuzzles());
  }, []);

  const isPuzzleCompleted = (category: string, index: number) => {
    return completedPuzzles.has(`${category}-${String(index + 1)}`);
  };

  return (
    <div className="home">
      <h1>Nonogram 🧩</h1>
      <div className="page-links">
        <Link to="/designer">🎨 Puzzle Designer</Link>
      </div>
      <div className="puzzle-categories">
        {Object.entries(puzzleMap).map(([category, puzzles]) => (
          <div key={category} className="puzzle-category">
            <h2>{category}</h2>
            <div className="puzzle-links">
              {puzzles.map((_, index) => (
                <Link 
                  key={index} 
                  to={`/puzzle/${category}/${String(index + 1)}`}
                  className={isPuzzleCompleted(category, index) ? 'completed' : ''}
                  title={isPuzzleCompleted(category, index) ? 'Completed' : ''}
                >
                  {isPuzzleCompleted(category, index) && <span className="check">✓</span>}
                  {index + 1}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
