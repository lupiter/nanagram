const AVAILABLE_SIZES = [5, 10, 15, 20] as const;

interface DesignerControlsProps {
  puzzleName: string;
  size: number;
  hasFilledCells: boolean;
  onNameChange: (name: string) => void;
  onSizeChange: (size: number) => void;
  onClear: () => void;
  onExport: () => void;
}

export default function DesignerControls({
  puzzleName,
  size,
  hasFilledCells,
  onNameChange,
  onSizeChange,
  onClear,
  onExport,
}: DesignerControlsProps) {
  return (
    <div className="designer-controls">
      <div className="name-input">
        <label htmlFor="puzzle-name">Name:</label>
        <input
          type="text"
          id="puzzle-name"
          value={puzzleName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter puzzle name"
        />
      </div>

      <div className="size-selector">
        <label htmlFor="size-select">Size:</label>
        <select
          id="size-select"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {AVAILABLE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}×{s}
            </option>
          ))}
        </select>
      </div>

      <div className="designer-actions">
        <button onClick={onClear} className="btn-clear">
          🗑️ Clear
        </button>
        <button
          onClick={onExport}
          className="btn-export"
          disabled={!hasFilledCells}
          title="Copy puzzle code to clipboard"
        >
          📋 Copy Code
        </button>
      </div>
    </div>
  );
}

