import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VictoryPopup.css';

interface VictoryPopupProps {
  onClose: () => void;
  nextPuzzle: { category: string; id: string } | null;
  puzzleName: string;
}

export default function VictoryPopup({ onClose, nextPuzzle, puzzleName }: VictoryPopupProps) {
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
    navigate('/');
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
          <h2 id="victory-title">🎉 Congratulations! 🎉</h2>
          <p id="victory-description">You've solved the puzzle!</p>
          <p className="puzzle-name">{puzzleName}</p>
        <div className="victory-buttons">
          {nextPuzzle && (
            <button 
              onClick={handleNextPuzzle} 
              className="primary"
              aria-label="Go to next puzzle"
            >
              Next Puzzle →
            </button>
          )}
          <button 
            onClick={handleGoHome}
            aria-label="Go to home page"
          >
            Home
          </button>
          <button 
            onClick={onClose} 
            className="secondary"
            aria-label="Close victory message"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
