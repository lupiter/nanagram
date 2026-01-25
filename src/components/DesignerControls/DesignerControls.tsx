import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import FileUploadButton from "../FileUploadButton/FileUploadButton";
import FormField from "../FormField/FormField";
import { Icons } from "../Icons/Icons";

interface DesignerControlsProps {
  puzzleName: string;
  hasFilledCells: boolean;
  hasUniqueSolution: boolean;
  showDevTools: boolean;
  isSketchFormat?: boolean;
  onNameChange: (name: string) => void;
  onClear: () => void;
  onExport: () => void;
  onShare: () => void;
  onSave: () => void;
  onDownloadSSS?: () => void;
  onUploadSSS?: (file: File) => void;
}

export default function DesignerControls({
  puzzleName,
  hasFilledCells,
  hasUniqueSolution,
  showDevTools,
  isSketchFormat,
  onNameChange,
  onClear,
  onExport,
  onShare,
  onSave,
  onDownloadSSS,
  onUploadSSS,
}: DesignerControlsProps) {
  return (
    <ButtonGroup gap={4} align="center" wrap className="designer-controls">
      <FormField label="Name:" htmlFor="puzzle-name">
        <input
          type="text"
          id="puzzle-name"
          value={puzzleName}
          onChange={(e) => { onNameChange(e.target.value); }}
          placeholder="Enter puzzle name"
        />
      </FormField>

      <ButtonGroup gap={3}>
        <Button variant="danger" onClick={onClear} aria-label="clear" title="Clear puzzle">
          <Icons.Trash />
        </Button>
        {showDevTools && (
          <Button
            onClick={onExport}
            disabled={!hasFilledCells}
            title="Copy puzzle code to clipboard"
          >
            <Icons.Copy /> Copy Code
          </Button>
        )}
        {isSketchFormat && onDownloadSSS && (
          <Button
            onClick={onDownloadSSS}
            disabled={!hasUniqueSolution}
            title={hasUniqueSolution ? "Download as Sketch, Share, Solve file" : "Puzzle must have a unique solution to download"}
          >
            <Icons.Download />
          </Button>
        )}
        {isSketchFormat && onUploadSSS && (
          <FileUploadButton
            onFileSelect={onUploadSSS}
            disabled={!hasUniqueSolution}
            title={hasUniqueSolution ? "Add puzzle to existing Sketch, Share, Solve file" : "Puzzle must have a unique solution to upload"}
          >
            <Icons.Upload />
          </FileUploadButton>
        )}
        <Button
          onClick={onSave}
          disabled={!hasFilledCells}
          title="Save to my designs"
        >
          <Icons.Save />
        </Button>
        <Button
          variant="primary"
          onClick={onShare}
          disabled={!hasUniqueSolution}
          title={hasUniqueSolution ? "Copy shareable link to clipboard" : "Puzzle must have a unique solution to share"}
        >
          <Icons.Link />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
