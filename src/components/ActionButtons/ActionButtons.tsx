import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import { Icons } from "../Icons/Icons";

interface ActionButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onSettingsClick?: () => void;
}

export default function ActionButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onSettingsClick,
}: ActionButtonsProps) {
  return (
    <ButtonGroup gap={1} justify="center" align="center">
      <Button square onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
        <Icons.Undo />
      </Button>
      <Button square onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
        <Icons.Redo />
      </Button>
      <Button square onClick={onReset} aria-label="Reset puzzle" variant="danger">
        <Icons.Reset />
      </Button>
      {onSettingsClick && (
        <Button square variant="secondary" onClick={onSettingsClick} aria-label="Settings" title="Settings">
          <Icons.Settings />
        </Button>
      )}
    </ButtonGroup>
  );
}

