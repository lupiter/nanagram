import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PuzzleSolutionData } from "../types/nonogram";
import SolutionPreview from "./SolutionPreview";
import "./VictoryPopup.css";

interface VictoryPopupProps {
  onClose: () => void;
  nextPuzzle: { category: string; id: string } | null;
  puzzleName: string;
  solution: PuzzleSolutionData;
}

export default function VictoryPopup({
  onClose,
  nextPuzzle,
  puzzleName,
  solution,
}: VictoryPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }
  }, []);

  const handleNextPuzzle = () => {
    if (nextPuzzle) {
      navigate(`/puzzle/${nextPuzzle.category}/${nextPuzzle.id}`);
      onClose();
    }
  };

  const handleGoHome = () => {
    navigate("/");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="victory-dialog"
      aria-labelledby="victory-title"
      aria-describedby="victory-description"
    >
      <div className="victory-content">
        <button onClick={onClose} className="secondary close-button" aria-label="Close">
          ✕
        </button>
        <h2 id="victory-title">Congratulations</h2>
        <div className="solution-preview-container">
          <SolutionPreview solution={solution} />
        </div>
        <p className="puzzle-name">{puzzleName}</p>
        <div className="victory-buttons">
          <button onClick={handleGoHome} aria-label="Go to home page">
            Home
          </button>
          {nextPuzzle && (
            <button
              onClick={handleNextPuzzle}
              className="primary"
              aria-label="Go to next puzzle"
            >
              Next Puzzle →
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
