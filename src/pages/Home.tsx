import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';
import { puzzleMap, getCompletedPuzzles } from '../utils/puzzleLoader';
import { usePageTitle } from '../hooks/usePageTitle';
import SolutionPreview from '../components/SolutionPreview';

export default function Home() {
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(new Set());
  const { setTitle } = usePageTitle();

  useEffect(() => {
    document.title = "Nanna Gram";
    setTitle({ title: "Nana Gram", subtitle: "👵📔" });
    setCompletedPuzzles(getCompletedPuzzles());
  }, [setTitle]);

  const isPuzzleCompleted = (category: string, index: number) => {
    return completedPuzzles.has(`${category}-${String(index + 1)}`);
  };

  return (
    <div className="home">
      <div className="puzzle-categories">
        {Object.entries(puzzleMap).map(([category, puzzles]) => {
          // Extract size from category (e.g., "5x5" -> 5)
          const size = parseInt(category.split('x')[0], 10);
          return (
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
                <Link 
                  to={`/designer/${String(size)}`}
                  className="designer-link"
                  title={`Design a ${category} puzzle`}
                >
                  ✏︎
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
