import Button from "./Button";

interface ActionButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export default function ActionButtons({ canUndo, canRedo, onUndo, onRedo, onReset }: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      <Button onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
        ↩ Undo
      </Button>
      <Button onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
        ↪ Redo
      </Button>
      <Button onClick={onReset} aria-label="Reset puzzle">
        🔄 Reset
      </Button>
    </div>
  );
}

