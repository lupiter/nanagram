import Button from "./Button";

interface DesignerControlsProps {
  puzzleName: string;
  hasFilledCells: boolean;
  hasUniqueSolution: boolean;
  showDevTools: boolean;
  onNameChange: (name: string) => void;
  onClear: () => void;
  onExport: () => void;
  onShare: () => void;
}

export default function DesignerControls({
  puzzleName,
  hasFilledCells,
  hasUniqueSolution,
  showDevTools,
  onNameChange,
  onClear,
  onExport,
  onShare,
}: DesignerControlsProps) {
  return (
    <div className="designer-controls">
      <div className="name-input">
        <label htmlFor="puzzle-name">Name:</label>
        <input
          type="text"
          id="puzzle-name"
          value={puzzleName}
          onChange={(e) => { onNameChange(e.target.value); }}
          placeholder="Enter puzzle name"
        />
      </div>

      <div className="designer-actions">
        <Button variant="danger" onClick={onClear} aria-label="clear" title="Clear puzzle">
          🗑︎
        </Button>
        {showDevTools && (
          <Button
            onClick={onExport}
            disabled={!hasFilledCells}
            title="Copy puzzle code to clipboard"
          >
            📋︎ Copy Code
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onShare}
          disabled={!hasUniqueSolution}
          title={hasUniqueSolution ? "Copy shareable link to clipboard" : "Puzzle must have a unique solution to share"}
        >
          🔗︎
        </Button>
      </div>
    </div>
  );
}

