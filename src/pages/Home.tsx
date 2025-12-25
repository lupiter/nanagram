import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';
import { puzzleMap, getCompletedPuzzles } from '../utils/puzzleLoader';
import SolutionPreview from '../components/SolutionPreview';

export default function Home() {
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "Nanna Gram";
    setCompletedPuzzles(getCompletedPuzzles());
  }, []);

  const isPuzzleCompleted = (category: string, index: number) => {
    return completedPuzzles.has(`${category}-${String(index + 1)}`);
  };

  return (
    <div className="home">
      <h1>Nanna Gram 👵📔</h1>
      <div className="puzzle-categories">
        {Object.entries(puzzleMap).map(([category, puzzles]) => (
          <div key={category} className="puzzle-category">
            <h2>{category}</h2>
            <div className="puzzle-links">
              {puzzles.map((puzzle, index) => {
                const completed = isPuzzleCompleted(category, index);
                return (
                  <Link 
                    key={index} 
                    to={`/puzzle/${category}/${String(index + 1)}`}
                    className={completed ? 'completed' : ''}
                    title={completed ? puzzle.name : `Puzzle ${String(index + 1)}`}
                  >
                    {completed ? (
                      <>
                        <SolutionPreview solution={puzzle.solution} maxSize={44} />
                        <span className="puzzle-name">{puzzle.name}</span>
                      </>
                    ) : (
                      index + 1
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div className="puzzle-category">
          <h2>Make your own</h2>
          <div className="puzzle-links">
            <Link to="/designer" aria-label="Designer">✏️</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
