import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { generateRandomPuzzleAsync } from '../utils/randomPuzzleGenerator';
import { encodePuzzle } from '../utils/puzzleCodec';
import DifficultyStars from '../components/DifficultyStars';
import ToggleGroup from '../components/ToggleGroup';
import './RandomPuzzle.css';

const VALID_SIZES = [5, 10, 15, 20] as const;
const MAX_DIFFICULTY = 4; // Limit to 4 as difficulty 5 is very slow
const DIFFICULTIES = [1, 2, 3, MAX_DIFFICULTY] as const;

export default function RandomPuzzle() {
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();
  const [size, setSize] = useState(10);
  const [difficulty, setDifficulty] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ attempt: 0, found: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Random Puzzle - Nanna Gram';
    setTitle({ title: 'Random Puzzle', subtitle: 'Generate a new challenge' });
  }, [setTitle]);

  const sizeOptions = useMemo(() => 
    VALID_SIZES.map((s) => ({
      value: s,
      label: `${s}×${s}`,
      ariaLabel: `${s} by ${s} grid`
    })), 
  []);

  const difficultyOptions = useMemo(() =>
    DIFFICULTIES.map((d) => ({
      value: d,
      label: <DifficultyStars difficulty={d} maxStars={MAX_DIFFICULTY} size="small" />,
      ariaLabel: `Difficulty ${d} of ${MAX_DIFFICULTY}`
    })),
  []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setProgress({ attempt: 0, found: 0 });

    try {
      // Use more attempts for higher difficulties
      const maxAttempts = difficulty >= 3 ? 5000 : 1000;
      
      const result = await generateRandomPuzzleAsync(
        size,
        difficulty,
        maxAttempts,
        (attempt, found) => setProgress({ attempt, found })
      );

      if (result) {
        const encoded = encodePuzzle('Random', result.solution, result.difficulty);
        navigate(`/play/${encoded}`);
      } else {
        setError(`Could not find a puzzle with difficulty ${difficulty} or higher. Try a lower difficulty or different size.`);
      }
    } catch (err) {
      setError('An error occurred while generating the puzzle.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [size, difficulty, navigate]);

  return (
    <div className="random-puzzle">
      <div className="random-puzzle-form">
        <ToggleGroup
          name="size"
          title="Puzzle Size"
          value={size}
          onChange={setSize}
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
          <p className="difficulty-warning">
            Higher difficulties may take longer to generate, especially for larger puzzles.
          </p>
        )}

        <button
          type="button"
          className="generate-button"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Puzzle'}
        </button>

        {isGenerating && (
          <div className="progress-info">
            <div className="progress-text">
              Searching... (Attempt {progress.attempt}, {progress.found} valid puzzles found)
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, (progress.attempt / 1000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
