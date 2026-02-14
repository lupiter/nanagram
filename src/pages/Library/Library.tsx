import { useState, useCallback, useEffect } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { designStorage, SavedDesign } from "../../services/DesignStorage";
import { sssFormat } from "../../services/SSSFormat";
import { difficultyAnalyzer } from "../../services/DifficultyAnalyzer";
import Button from "../../components/Button/Button";
import ButtonGroup from "../../components/ButtonGroup/ButtonGroup";
import FileUploadButton from "../../components/FileUploadButton/FileUploadButton";
import PuzzleCard from "../../components/PuzzleCard/PuzzleCard";
import PageContainer from "../../components/PageContainer/PageContainer";
import CardGrid from "../../components/CardGrid/CardGrid";
import Toast from "../../components/Toast/Toast";
import Settings from "../../components/Settings/Settings";
import { Icons } from "../../components/Icons/Icons";
import "./Library.css";

export default function Library() {
  const { setTitle } = usePageTitle();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    document.title = "Settings & Data - Nanagram";
    setTitle({ title: "Settings & Data" });
    setDesigns(designStorage.getAll());
  }, [setTitle]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => { setMessage(""); }, 3000);
  };

  // Export all designs as JSON
  const handleExportAll = useCallback(() => {
    if (designs.length === 0) {
      showMessage("No designs to export");
      return;
    }
    designStorage.download("my-designs.json");
    showMessage(`Exported ${String(designs.length)} designs`);
  }, [designs.length]);

  // Import designs from JSON
  const handleImportFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = designStorage.parseExportedJson(content);
      if (parsed) {
        const result = designStorage.import(parsed, true);
        setDesigns(designStorage.getAll());
        showMessage(`Imported ${String(result.imported)} designs (${String(result.skipped)} duplicates skipped)`);
      } else {
        showMessage("Invalid file format");
      }
    };
    reader.readAsText(file);
  }, []);

  // Import puzzles from SSS file into library
  const handleImportSSS = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const sssFile = sssFormat.parse(content);
      if (!sssFile) {
        showMessage("Invalid SSS file format");
        return;
      }

      // Convert SSS puzzles to SavedDesign format
      const newDesigns: SavedDesign[] = [];
      for (const puzzleId of Object.keys(sssFile.puzzles)) {
        const puzzle = sssFile.puzzles[puzzleId];
        const grid = sssFormat.stringToGrid(puzzle.grid);
        newDesigns.push({
          id: puzzleId,
          name: puzzle.title,
          height: 10,
          width: 15,
          difficulty: difficultyAnalyzer.getRating(grid),
          solution: grid,
          createdAt: new Date().toISOString(),
        });
      }

      const result = designStorage.import(newDesigns, true);
      setDesigns(designStorage.getAll());
      showMessage(`Imported ${String(result.imported)} puzzles from SSS file (${String(result.skipped)} duplicates skipped)`);
    };
    reader.readAsText(file);
  }, []);

  // Merge 10x15 designs into an SSS file
  const handleMergeToSSS = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const sssFile = sssFormat.parse(content);
      if (!sssFile) {
        showMessage("Invalid SSS file format");
        return;
      }

      // Filter to only 10x15 designs
      const designs10x15 = designs.filter(d => d.height === 10 && d.width === 15);
      if (designs10x15.length === 0) {
        showMessage("No 10×15 designs to add");
        return;
      }

      // Add designs to SSS file
      const puzzlesToAdd = designs10x15.map(d => ({
        title: d.name,
        grid: d.solution,
      }));

      const result = sssFormat.addPuzzles(sssFile, puzzlesToAdd, "Nanagram", true);
      sssFormat.download(result.file, file.name);
      showMessage(`Added ${String(result.added)} puzzles to SSS file (${String(result.skipped)} duplicates skipped)`);
    };
    reader.readAsText(file);
  }, [designs]);

  // Export 10x15 designs as new SSS file
  const handleExportAsSSS = useCallback(() => {
    const designs10x15 = designs.filter(d => d.height === 10 && d.width === 15);
    if (designs10x15.length === 0) {
      showMessage("No 10×15 designs to export");
      return;
    }

    const puzzlesToAdd = designs10x15.map(d => ({
      title: d.name,
      grid: d.solution,
    }));

    const result = sssFormat.addPuzzles(sssFormat.createEmptyFile(), puzzlesToAdd, "Nanagram", false);
    sssFormat.download(result.file, "my-puzzles.json");
    showMessage(`Exported ${String(result.added)} puzzles as SSS file`);
  }, [designs]);

  const designs10x15Count = designs.filter(d => d.height === 10 && d.width === 15).length;

  return (
    <PageContainer>
      <Toast message={message} visible={!!message} />

      <section className="panel library-section">
        <h2>Settings</h2>
        <Settings />
      </section>

      <section className="panel library-section">
        <h2>My Designs ({designs.length})</h2>
        {designs.length === 0 ? (
          <p className="text-muted">No saved designs yet. Create some in the Designer!</p>
        ) : (
          <CardGrid minCardWidth={100}>
            {designs.map((design) => (
              <PuzzleCard
                key={design.id}
                solution={design.solution}
                title={design.name}
                subtitle={`${String(design.height)}×${String(design.width)}`}
                difficulty={design.difficulty}
                previewSize={60}
                className="design-card"
              />
            ))}
          </CardGrid>
        )}
      </section>

      <section className="panel library-section">
        <h2>Export / Import</h2>
        <ButtonGroup gap={6} wrap className="library-actions">
          <ButtonGroup column gap={2} className="action-group">
            <h3>All Designs</h3>
            <Button onClick={handleExportAll} disabled={designs.length === 0}>
              <Icons.Download /> Export All as JSON
            </Button>
            <FileUploadButton onFileSelect={handleImportFile}>
              <Icons.Upload /> Import from JSON
            </FileUploadButton>
          </ButtonGroup>

          <ButtonGroup column gap={2} className="action-group">
            <h3>Sketch, Share, Solve Format</h3>
            <p className="text-muted-sm">10×15 puzzles only ({designs10x15Count} available)</p>
            <Button onClick={handleExportAsSSS} disabled={designs10x15Count === 0}>
              <Icons.Download /> Export as SSS File
            </Button>
            <FileUploadButton onFileSelect={handleImportSSS}>
              <Icons.Upload /> Import from SSS File
            </FileUploadButton>
            <FileUploadButton
              onFileSelect={handleMergeToSSS}
              disabled={designs10x15Count === 0}
            >
              <Icons.Merge /> Add My Designs to SSS File
            </FileUploadButton>
          </ButtonGroup>
        </ButtonGroup>
      </section>
    </PageContainer>
  );
}
