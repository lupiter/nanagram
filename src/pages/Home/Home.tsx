import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import "./Home.css";
import { puzzleLibrary } from "../../services/PuzzleLibrary";
import { usePageTitle } from "../../hooks/usePageTitle";
import { designStorage, SavedDesign } from "../../services/DesignStorage";
import { puzzleCodec } from "../../services/PuzzleCodec";
import SolutionPreview from "../../components/SolutionPreview/SolutionPreview";
import DifficultyStars from "../../components/DifficultyStars/DifficultyStars";
import { Icons } from "../../components/Icons/Icons";

function HeaderActions() {
  return (
    <>
      <Link to="/random" title="Random Puzzle" aria-label="Random Puzzle">
        <Icons.Dice />
      </Link>
      <Link to="/manage" title="Manage Puzzles" aria-label="Manage Puzzles">
        <Icons.Settings />
      </Link>
    </>
  );
}

export default function Home() {
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(
    new Set()
  );
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const { setTitle } = usePageTitle();
  const location = useLocation();

  useEffect(() => {
    document.title = "Nanna Gram";
    setTitle({
      title: "Nanagram",
      icon: <Icons.Logo />,
      actions: <HeaderActions />,
    });
    setCompletedPuzzles(puzzleLibrary.getCompletedPuzzles());
    setSavedDesigns(designStorage.getAll());
  }, [setTitle, location.key]);

  // Group saved designs by their size category
  const designsByCategory = useMemo(() => {
    const grouped: Record<string, SavedDesign[]> = {};
    for (const design of savedDesigns) {
      const category = `${String(design.height)}x${String(design.width)}`;
      if (!(category in grouped)) {
        grouped[category] = [];
      }
      grouped[category].push(design);
    }
    return grouped;
  }, [savedDesigns]);

  const isPuzzleCompleted = (category: string, index: number) => {
    return completedPuzzles.has(`${category}-${String(index + 1)}`);
  };

  // Helper to render a user design card
  const renderDesignCard = (design: SavedDesign) => {
    const encoded = puzzleCodec.encode(design.name, design.solution, design.difficulty);
    const isNonSquare = design.height !== design.width;
    const designerSize = isNonSquare ? `${String(design.height)}x${String(design.width)}` : String(design.height);
    
    return (
      <div key={design.id} className="design-item user-design">
        <Link
          to={`/designer/${designerSize}?edit=${design.id}`}
          className="edit-badge"
          title="Edit design"
        >
          <Icons.Edit />
        </Link>
        <Link
          to={`/play/${encoded}`}
          className="puzzle-link completed"
          title={`Play: ${design.name}`}
        >
          <SolutionPreview
            solution={design.solution}
            maxSize={100}
          />
          <span className="puzzle-name">{design.name}</span>
          <DifficultyStars
            difficulty={design.difficulty}
            size="small"
          />
        </Link>
      </div>
    );
  };

  return (
    <div className="home">
      <div className="puzzle-categories">
        {Object.entries(puzzleLibrary.puzzleMap).map(([category, puzzles]) => {
          // Extract size from category (e.g., "5x5" -> 5, "10x15" -> "10x15")
          const parts = category.split("x");
          const isNonSquare = parts[0] !== parts[1];
          const designerPath = isNonSquare ? `/designer/${category}` : `/designer/${parts[0]}`;
          // Get user designs for this category
          const userDesigns = designsByCategory[category] ?? [];
          
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
                      className={`puzzle-link${completed ? " completed" : ""}`}
                      title={
                        completed ? puzzle.name : `Puzzle ${String(index + 1)}`
                      }
                    >
                      {completed ? (
                        <>
                          <SolutionPreview
                            solution={puzzle.solution}
                            maxSize={100}
                          />
                          <span className="puzzle-name">{puzzle.name}</span>
                          <DifficultyStars
                            difficulty={puzzle.difficulty}
                            size="small"
                          />
                        </>
                      ) : (
                        <>
                          <span className="puzzle-number">{index + 1}</span>
                          <DifficultyStars
                            difficulty={puzzle.difficulty}
                            size="small"
                          />
                        </>
                      )}
                    </Link>
                  );
                })}
                {/* User designs for this category */}
                {userDesigns.map(renderDesignCard)}
                <Link
                  to={designerPath}
                  className="puzzle-link designer-link"
                  title={`Design a ${category} puzzle`}
                >
                  <span className="designer-link-icon">
                    <span className="icon"><Icons.Edit /></span>
                  </span>
                  <span className="puzzle-name">{`Make your own`}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
