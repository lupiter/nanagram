import Button from "../Button/Button";
import { Icons } from "../Icons/Icons";

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
        <Icons.Undo />
      </Button>
      <Button onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
        <Icons.Redo />
      </Button>
      <Button onClick={onReset} aria-label="Reset puzzle" variant="danger">
        <Icons.Reset />
      </Button>
    </div>
  );
}

