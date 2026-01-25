import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CellState, PuzzleDefinition } from "../../types/nonogram";
import { usePuzzleGame } from "../../hooks/usePuzzleGame";
import { usePageTitle } from "../../hooks/usePageTitle";
import { puzzleCodec } from "../../services/PuzzleCodec";
import { difficultyAnalyzer } from "../../services/DifficultyAnalyzer";
import { sssFormat } from "../../services/SSSFormat";
import { SSSFile, SSSPuzzleWithCreator } from "../../types/sss";
import PuzzlePlayer from "../../components/PuzzlePlayer/PuzzlePlayer";
import PuzzleCard from "../../components/PuzzleCard/PuzzleCard";
import FileUploadButton from "../../components/FileUploadButton/FileUploadButton";
import PageContainer from "../../components/PageContainer/PageContainer";
import CardGrid from "../../components/CardGrid/CardGrid";
import UploadZone from "../../components/UploadZone/UploadZone";
import "./Play.css";

// SSS Browser component (shown when no encoded param)
function SSSBrowser() {
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();

  const [sssFile, setSSSFile] = useState<SSSFile | null>(null);
  const [sssPuzzles, setSSsPuzzles] = useState<SSSPuzzleWithCreator[]>([]);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    document.title = "Sketch, Share, Solve - Nanna Gram";
    setTitle({ title: "Sketch, Share, Solve", subtitle: "Browse puzzles" });
  }, [setTitle]);

  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = sssFormat.parse(content);
        if (parsed) {
          setSSSFile(parsed);
          setSSsPuzzles(sssFormat.getAllPuzzles(parsed));
        } else {
          alert("Invalid SSS file format");
        }
      } catch (error) {
        console.error("Failed to parse SSS file:", error);
        alert("Failed to parse file. Please ensure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handlePuzzleSelect = useCallback((item: SSSPuzzleWithCreator) => {
    const solution = sssFormat.stringToGrid(item.puzzle.grid);
    const difficulty = difficultyAnalyzer.getRating(solution);
    const encodedPuzzle = puzzleCodec.encode(item.puzzle.title, solution, difficulty);
    void navigate(`/play/${encodedPuzzle}`);
  }, [navigate]);

  return (
    <PageContainer>
      {!sssFile ? (
        <UploadZone message="Open a Sketch, Share, Solve file to browse and play puzzles.">
          <FileUploadButton onFileSelect={handleFileUpload}>
            📂 Open File
          </FileUploadButton>
        </UploadZone>
      ) : (
        <div className="sss-puzzle-list">
          <div className="sss-header">
            <span className="sss-file-name">{fileName}</span>
            <FileUploadButton onFileSelect={handleFileUpload}>
              📂 Open Different File
            </FileUploadButton>
          </div>
          <p className="sss-count">{sssPuzzles.length} puzzles</p>
          <CardGrid minCardWidth={120}>
            {sssPuzzles.map((item) => {
              const solution = sssFormat.stringToGrid(item.puzzle.grid);
              const difficulty = difficultyAnalyzer.getRating(solution);
              return (
                <PuzzleCard
                  key={item.puzzle.id}
                  solution={solution}
                  title={item.puzzle.title}
                  subtitle={item.creator ? `by ${item.creator.name}` : undefined}
                  difficulty={difficulty}
                  onClick={() => { handlePuzzleSelect(item); }}
                />
              );
            })}
          </CardGrid>
        </div>
      )}
    </PageContainer>
  );
}

// Encoded Puzzle Player component (shown when encoded param exists)
function EncodedPuzzlePlayer({ encoded }: { encoded: string }) {
  const { setTitle } = usePageTitle();

  const puzzle: PuzzleDefinition | null = useMemo(() => {
    try {
      const { name, solution, difficulty } = puzzleCodec.decode(encoded);
      const height = solution.length;
      const width = solution[0]?.length ?? 0;
      return { name, height, width, solution, difficulty };
    } catch {
      return null;
    }
  }, [encoded]);

  const puzzleKey = useMemo(() => `play-${encoded.slice(0, 16)}`, [encoded]);

  const { state, setState, controller } = usePuzzleGame({
    category: "play",
    id: puzzleKey,
    puzzle: puzzle ?? { name: "Invalid", height: 1, width: 1, difficulty: 0, solution: [[CellState.EMPTY]] },
  });

  useEffect(() => {
    if (puzzle) {
      const size = `${String(puzzle.solution.length)}×${String(puzzle.solution[0].length)}`;
      const title = puzzle.name === "Random" ? "Random Puzzle" : "Shared Puzzle";
      document.title = `${title} - Nanna Gram`;
      setTitle({ title, subtitle: size });
    } else {
      document.title = "Invalid Puzzle - Nanna Gram";
      setTitle({ title: "Invalid Puzzle" });
    }
  }, [puzzle, setTitle]);

  return (
    <PuzzlePlayer
      puzzle={puzzle}
      state={state}
      setState={setState}
      controller={controller}
      showDifficulty={true}
    />
  );
}

// Main Play component - routes between SSS Browser and Encoded Puzzle Player
export default function Play() {
  const { encoded } = useParams<{ encoded?: string }>();

  if (!encoded) {
    return <SSSBrowser />;
  }

  return <EncodedPuzzlePlayer encoded={encoded} />;
}
