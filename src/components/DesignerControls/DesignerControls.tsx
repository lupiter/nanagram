import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import FileUploadButton from "../FileUploadButton/FileUploadButton";
import FormField from "../FormField/FormField";
import { Icons } from "../Icons/Icons";

type SaveStatus = "idle" | "saved" | "updated" | "duplicate";
type CopyStatus = "idle" | "copied";

interface DesignerControlsProps {
  puzzleName: string;
  hasFilledCells: boolean;
  hasUniqueSolution: boolean;
  showDevTools: boolean;
  isSketchFormat?: boolean;
  saveStatus?: SaveStatus;
  shareStatus?: CopyStatus;
  exportStatus?: CopyStatus;
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
  saveStatus = "idle",
  shareStatus = "idle",
  exportStatus = "idle",
  onNameChange,
  onClear,
  onExport,
  onShare,
  onSave,
  onDownloadSSS,
  onUploadSSS,
}: DesignerControlsProps) {
  // Determine save button appearance based on status
  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case "saved":
      case "updated":
        return <Icons.Check />;
      case "duplicate":
        return <Icons.Close />;
      default:
        return <Icons.Save />;
    }
  };

  const getSaveButtonVariant = (): "default" | "primary" | "secondary" | "danger" => {
    switch (saveStatus) {
      case "saved":
      case "updated":
        return "primary";
      case "duplicate":
        return "danger";
      default:
        return "default";
    }
  };

  const getSaveButtonTitle = () => {
    switch (saveStatus) {
      case "saved":
        return "Saved!";
      case "updated":
        return "Updated!";
      case "duplicate":
        return "Already exists";
      default:
        return "Save to my designs";
    }
  };
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

      <ButtonGroup gap={1}>
        <Button variant="danger" onClick={onClear} aria-label="clear" title="Clear puzzle">
          <Icons.Trash />
        </Button>
        {showDevTools && (
          <Button
            variant={exportStatus === "copied" ? "primary" : "default"}
            onClick={onExport}
            disabled={!hasFilledCells || exportStatus !== "idle"}
            title={exportStatus === "copied" ? "Copied!" : "Copy puzzle code to clipboard"}
          >
            {exportStatus === "copied" ? <Icons.Check /> : <Icons.Copy />} Copy Code
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
          variant={getSaveButtonVariant()}
          onClick={onSave}
          disabled={!hasFilledCells || saveStatus !== "idle"}
          title={getSaveButtonTitle()}
        >
          {getSaveButtonContent()}
        </Button>
        <Button
          variant="primary"
          onClick={onShare}
          disabled={!hasUniqueSolution || shareStatus !== "idle"}
          title={shareStatus === "copied" ? "Link copied!" : (hasUniqueSolution ? "Copy shareable link to clipboard" : "Puzzle must have a unique solution to share")}
        >
          {shareStatus === "copied" ? <Icons.Check /> : <Icons.Link />}
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
