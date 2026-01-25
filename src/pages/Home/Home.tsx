import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import "./Home.css";
import { puzzleLibrary } from "../../services/PuzzleLibrary";
import { usePageTitle } from "../../hooks/usePageTitle";
import { designStorage, SavedDesign } from "../../services/DesignStorage";
import { puzzleCodec } from "../../services/PuzzleCodec";
import SolutionPreview from "../../components/SolutionPreview/SolutionPreview";
import DifficultyStars from "../../components/DifficultyStars/DifficultyStars";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import LinkCard from "../../components/LinkCard/LinkCard";
import { Icons } from "../../components/Icons/Icons";

export default function Home() {
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(
    new Set()
  );
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    document.title = "Nanna Gram";
    setTitle({ title: "Nana Gram", subtitle: <Icons.Logo /> });
    setCompletedPuzzles(puzzleLibrary.getCompletedPuzzles());
    setSavedDesigns(designStorage.getAll());
  }, [setTitle]);

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

  const handleDeleteDesign = useCallback((id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      designStorage.delete(id);
      setSavedDesigns(designStorage.getAll());
    }
  }, []);

  const handleShare = useCallback((design: SavedDesign) => {
    const encoded = puzzleCodec.encode(design.name, design.solution, design.difficulty);
    const url = `${window.location.origin}${window.location.pathname}#/play/${encoded}`;
    navigator.clipboard.writeText(url).catch((err: unknown) => {
      console.error("Failed to copy:", err);
    });
    alert("Link copied to clipboard!");
  }, []);

  // Helper to render a user design card
  const renderDesignCard = (design: SavedDesign) => {
    const encoded = puzzleCodec.encode(design.name, design.solution, design.difficulty);
    const isNonSquare = design.height !== design.width;
    const designerSize = isNonSquare ? `${String(design.height)}x${String(design.width)}` : String(design.height);
    
    return (
      <div key={design.id} className="design-item user-design">
        <span className="user-badge" title="Your design"><Icons.Sparkle /></span>
        <Link
          to={`/play/${encoded}`}
          className="completed"
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
        <ButtonGroup gap={1} justify="center" className="design-actions">
          <Button
            square
            onClick={() => { handleShare(design); }}
            title="Copy share link"
          >
            <Icons.Link />
          </Button>
          <Button
            square
            to={`/designer/${designerSize}?edit=${design.id}`}
            title="Edit design"
          >
            <Icons.Edit />
          </Button>
          <Button
            variant="danger"
            square
            onClick={() => { handleDeleteDesign(design.id, design.name); }}
            title="Delete design"
          >
            <Icons.Close />
          </Button>
        </ButtonGroup>
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
                      className={completed ? "completed" : ""}
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
                  className="designer-link"
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

        <ButtonGroup gap={4} justify="center" wrap className="special-links-container">
          <LinkCard to="/random" icon={<Icons.Dice />}>Random Puzzle</LinkCard>
          <LinkCard to="/play" icon={<Icons.Folder />}>Sketch, Share, Solve</LinkCard>
          <LinkCard to="/library" icon={<Icons.Library />}>My Library</LinkCard>
        </ButtonGroup>
      </div>
    </div>
  );
}
