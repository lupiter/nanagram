import { useNavigate } from "react-router-dom";
import { PuzzleSolutionData } from "../types/nonogram";
import Button from "./Button";
import Modal from "./Modal";
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
  const navigate = useNavigate();

  const handleNextPuzzle = () => {
    if (nextPuzzle) {
      void navigate(`/puzzle/${nextPuzzle.category}/${nextPuzzle.id}`);
      onClose();
    }
  };

  const handleGoHome = () => {
    void navigate("/");
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Congratulations" className="victory-modal">
      <div className="victory-content">
        <div className="solution-preview-container">
          <SolutionPreview solution={solution} />
        </div>
        <p className="puzzle-name">{puzzleName}</p>
        <div className="victory-buttons">
          <Button onClick={handleGoHome} aria-label="Go to home page">
            Home
          </Button>
          {nextPuzzle && (
            <Button variant="primary" onClick={handleNextPuzzle} aria-label="Go to next puzzle">
              Next Puzzle →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
