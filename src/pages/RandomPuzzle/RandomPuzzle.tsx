import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { puzzleGenerator } from "../../services/PuzzleGenerator";
import { puzzleCodec } from "../../services/PuzzleCodec";
import DifficultyStars from '../../components/DifficultyStars/DifficultyStars';
import ToggleGroup from '../../components/ToggleGroup/ToggleGroup';
import PageContainer from '../../components/PageContainer/PageContainer';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import StatusMessage from '../../components/StatusMessage/StatusMessage';
import './RandomPuzzle.css';

interface PuzzleSize {
  height: number;
  width: number;
  label: string;
}

const VALID_SIZES: PuzzleSize[] = [
  { height: 5, width: 5, label: '5×5' },
  { height: 10, width: 10, label: '10×10' },
  { height: 10, width: 15, label: '10×15' },
  { height: 15, width: 15, label: '15×15' },
  { height: 20, width: 20, label: '20×20' },
];
const MAX_DIFFICULTY = 4; // Limit to 4 as difficulty 5 is very slow
const DIFFICULTIES = [1, 2, 3, MAX_DIFFICULTY] as const;

export default function RandomPuzzle() {
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();
  const [sizeIndex, setSizeIndex] = useState(1); // Default to 10×10
  const [difficulty, setDifficulty] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ attempt: 0, found: 0 });
  const [error, setError] = useState<string | null>(null);
  
  const selectedSize = VALID_SIZES[sizeIndex];

  useEffect(() => {
    document.title = 'Random Puzzle - Nanna Gram';
    setTitle({ title: 'Random Puzzle', subtitle: 'Generate a new challenge' });
  }, [setTitle]);

  const sizeOptions = useMemo(() => 
    VALID_SIZES.map((s, index) => ({
      value: index,
      label: s.label,
      ariaLabel: `${String(s.height)} by ${String(s.width)} grid`
    })), 
  []);

  const difficultyOptions = useMemo(() =>
    DIFFICULTIES.map((d) => ({
      value: d,
      label: <DifficultyStars difficulty={d} maxStars={MAX_DIFFICULTY} size="small" />,
      ariaLabel: `Difficulty ${String(d)} of ${String(MAX_DIFFICULTY)}`
    })),
  []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setProgress({ attempt: 0, found: 0 });

    try {
      // Use more attempts for higher difficulties
      const maxAttempts = difficulty >= 3 ? 5000 : 1000;
      
      const result = await puzzleGenerator.generateAsync(
        selectedSize.height,
        difficulty,
        maxAttempts,
        (attempt, found) => { setProgress({ attempt, found }); return; },
        selectedSize.width
      );

      if (result) {
        const encoded = puzzleCodec.encode('Random', result.solution, result.difficulty);
        void navigate(`/play/${encoded}`);
      } else {
        setError(`Could not find a puzzle with difficulty ${String(difficulty)} or higher. Try a lower difficulty or different size.`);
      }
    } catch (err) {
      setError('An error occurred while generating the puzzle.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSize, difficulty, navigate]);

  const progressPercent = Math.min(100, (progress.attempt / 1000) * 100);

  return (
    <PageContainer maxWidth="sm">
      <div className="random-puzzle-form">
        <ToggleGroup
          name="size"
          title="Puzzle Size"
          value={sizeIndex}
          onChange={setSizeIndex}
          options={sizeOptions}
          disabled={isGenerating}
        />

        <ToggleGroup
          name="difficulty"
          title="Minimum Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={difficultyOptions}
          disabled={isGenerating}
        />

        {difficulty >= 3 && (
          <StatusMessage variant="warning">
            Higher difficulties may take longer to generate, especially for larger puzzles.
          </StatusMessage>
        )}

        <button
          type="button"
          className="generate-button"
          onClick={() => { void handleGenerate(); }}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Puzzle'}
        </button>

        {isGenerating && (
          <ProgressBar
            progress={progressPercent}
            label={`Searching... (Attempt ${String(progress.attempt)}, ${String(progress.found)} valid puzzles found)`}
          />
        )}

        {error && (
          <StatusMessage variant="error">
            {error}
          </StatusMessage>
        )}
      </div>
    </PageContainer>
  );
}
