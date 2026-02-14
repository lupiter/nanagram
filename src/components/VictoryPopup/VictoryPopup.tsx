import { useNavigate } from "react-router-dom";
import { PuzzleSolutionData } from "../../types/nonogram";
import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import Modal from "../Modal/Modal";
import SolutionPreview from "../SolutionPreview/SolutionPreview";
import { Icons } from "../Icons/Icons";
import "./VictoryPopup.css";

interface RandomAgainParams {
  width: number;
  height: number;
  difficulty: number;
}

interface VictoryPopupProps {
  onClose: () => void;
  nextPuzzle: { category: string; id: string } | null;
  randomAgainParams?: RandomAgainParams | null;
  puzzleName: string;
  solution: PuzzleSolutionData;
}

export default function VictoryPopup({
  onClose,
  nextPuzzle,
  randomAgainParams = null,
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

  const handleAnotherPuzzle = () => {
    if (randomAgainParams) {
      const { width, height, difficulty } = randomAgainParams;
      void navigate(
        `/random?width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}&difficulty=${encodeURIComponent(difficulty)}`
      );
      onClose();
    }
  };

  const handleGoHome = () => {
    void navigate("/");
    onClose();
  };

  const showNext = nextPuzzle ?? null;
  const showAnother = randomAgainParams ?? null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Congratulations" className="victory-modal">
      <div className="victory-content">
        <div className="solution-preview-container">
          <SolutionPreview solution={solution} />
        </div>
        <p className="puzzle-name">{puzzleName}</p>
        <ButtonGroup justify="between">
          <Button onClick={handleGoHome} aria-label="Go to home page">
            Home
          </Button>
          {showNext && (
            <Button variant="primary" onClick={handleNextPuzzle} aria-label="Go to next puzzle">
              Next Puzzle <Icons.ArrowRight />
            </Button>
          )}
          {showAnother && (
            <Button variant="primary" onClick={handleAnotherPuzzle} aria-label="Generate another puzzle of same size">
              Another puzzle <Icons.ArrowRight />
            </Button>
          )}
        </ButtonGroup>
      </div>
    </Modal>
  );
}
