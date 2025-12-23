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
      <button onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
        ↩ Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
        ↪ Redo
      </button>
      <button onClick={onReset} aria-label="Reset puzzle">
        🔄 Reset
      </button>
    </div>
  );
}

