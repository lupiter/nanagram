import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDesigner } from "../../hooks/useDesigner";
import { usePageTitle } from "../../hooks/usePageTitle";
import NonogramGrid from "../../components/NonogramGrid/NonogramGrid";
import DesignerControls from "../../components/DesignerControls/DesignerControls";
import SolutionStatus from "../../components/SolutionStatus/SolutionStatus";
import DesignerInfo from "../../components/DesignerInfo/DesignerInfo";
import PageContainer from "../../components/PageContainer/PageContainer";
import { CellState } from "../../types/nonogram";
import { sssFormat, SSSFile } from "../../services/SSSFormat";
import { designStorage, SavedDesign } from "../../services/DesignStorage";
import "./Designer.css";

const VALID_SIZES = [5, 10, 15, 20, 25];

// Special size string for 10x15 Sketch format
const SKETCH_SIZE = "10x15";

export default function Designer() {
  const { size: sizeParam } = useParams<{ size: string }>();
  
  // Check if this is the Sketch format (10x15)
  const isSketchFormat = sizeParam === SKETCH_SIZE;
  const size = isSketchFormat ? 10 : (VALID_SIZES.includes(Number(sizeParam)) ? Number(sizeParam) : 5);
  const width = isSketchFormat ? 15 : size;
  
  const [searchParams] = useSearchParams();
  const showDevTools = searchParams.get("dev") === "true";
  const editId = searchParams.get("edit");
  const { state, setState, controller, dragJustEndedCellsRef } = useDesigner(size, width);
  const { setTitle } = usePageTitle();
  
  // State for SSS file operations
  const [sssFile, setSSSFile] = useState<SSSFile | null>(null);
  
  // Track if we're editing an existing design
  const [editingDesign, setEditingDesign] = useState<SavedDesign | null>(null);
  
  // Save feedback state: "idle" | "saved" | "updated" | "duplicate"
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "updated" | "duplicate">("idle");
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Share feedback state
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const shareStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Export feedback state
  const [exportStatus, setExportStatus] = useState<"idle" | "copied">("idle");
  const exportStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Load design for editing on mount
  useEffect(() => {
    if (editId) {
      const design = designStorage.getById(editId);
      if (design) {
        setEditingDesign(design);
        setState((s) => controller.loadDesign(s, design));
      }
    }
  }, [editId, controller, setState]);

  useEffect(() => {
    document.title = "Designer - Nanagram";
    const subtitle = `${String(state.height)}×${String(state.width)}`;
    setTitle({ title: "Designer", subtitle });
  }, [setTitle, state.height, state.width]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const key = `${String(row)},${String(col)}`;
      if (dragJustEndedCellsRef.current?.has(key)) {
        dragJustEndedCellsRef.current.delete(key);
        if (dragJustEndedCellsRef.current.size === 0) {
          dragJustEndedCellsRef.current = null;
        }
        return;
      }
      setState((s) => {
        if (s.isDragging && (s.draggedCells.get(row)?.has(col) ?? false)) {
          return s;
        }
        return controller.toggleCell(s, row, col);
      });
    },
    [controller, setState, dragJustEndedCellsRef]
  );

  const handlePointerDown = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (e.button === 2) return; // Ignore right click
      setState((s) => controller.startDrag(s, row, col));
    },
    [controller, setState]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      setState((s) => controller.continueDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleNameChange = useCallback(
    (name: string) => {
      setState((s) => controller.setPuzzleName(s, name));
    },
    [controller, setState]
  );

  const handleClear = useCallback(() => {
    setState((s) => controller.clear(s));
  }, [controller, setState]);

  const handleExport = useCallback(() => {
    const json = controller.exportJson(state);
    
    if (exportStatusTimeoutRef.current) {
      clearTimeout(exportStatusTimeoutRef.current);
    }
    
    navigator.clipboard.writeText(json)
      .then(() => {
        setExportStatus("copied");
        exportStatusTimeoutRef.current = setTimeout(() => { setExportStatus("idle"); }, 2000);
      })
      .catch((err: unknown) => {
        console.error("Failed to copy:", err);
      });
  }, [controller, state]);

  const handleShare = useCallback(() => {
    const url = controller.getShareUrl(state);
    
    if (shareStatusTimeoutRef.current) {
      clearTimeout(shareStatusTimeoutRef.current);
    }
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setShareStatus("copied");
        shareStatusTimeoutRef.current = setTimeout(() => { setShareStatus("idle"); }, 2000);
      })
      .catch((err: unknown) => {
        console.error("Failed to copy:", err);
      });
  }, [controller, state]);

  const handleSave = useCallback(() => {
    const puzzleName = state.puzzleName.trim() || "Untitled";
    const difficulty = state.difficulty ?? 0;
    
    // Clear any existing timeout
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    
    // If editing an existing design, update it
    if (editingDesign) {
      designStorage.update(editingDesign.id, {
        name: puzzleName,
        height: state.height,
        width: state.width,
        difficulty,
        solution: state.grid,
      });
      setSaveStatus("updated");
      saveStatusTimeoutRef.current = setTimeout(() => { setSaveStatus("idle"); }, 2000);
      return;
    }
    
    // Check for duplicate only when creating new
    const duplicate = designStorage.findDuplicate(state.grid);
    if (duplicate) {
      setSaveStatus("duplicate");
      saveStatusTimeoutRef.current = setTimeout(() => { setSaveStatus("idle"); }, 2000);
      return;
    }
    
    const saved = designStorage.save({
      name: puzzleName,
      height: state.height,
      width: state.width,
      difficulty,
      solution: state.grid,
    });
    
    // Start editing the newly saved design
    setEditingDesign(saved);
    setSaveStatus("saved");
    saveStatusTimeoutRef.current = setTimeout(() => { setSaveStatus("idle"); }, 2000);
  }, [state, editingDesign]);

  // SSS format handlers
  const handleDownloadSSS = useCallback(() => {
    const puzzleName = state.puzzleName.trim() || "Untitled";
    // Convert grid to number[][] for SSS format
    const gridAsNumbers = state.grid.map(row => row.map(cell => cell === CellState.FILLED ? 1 : 0));
    
    // Add to existing file or create new one
    const baseFile = sssFile ?? sssFormat.createEmptyFile();
    const updatedFile = sssFormat.addPuzzle(baseFile, {
      title: puzzleName,
      grid: gridAsNumbers,
    }, "Designer");
    
    setSSSFile(updatedFile);
    sssFormat.download(updatedFile, `${puzzleName.replace(/\s+/g, '_')}.json`);
  }, [state.puzzleName, state.grid, sssFile]);

  const handleUploadSSS = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const parsed = sssFormat.parse(content);
        if (parsed) {
          // Add current puzzle to the uploaded file
          const puzzleName = state.puzzleName.trim() || "Untitled";
          const gridAsNumbers = state.grid.map(row => row.map(cell => cell === CellState.FILLED ? 1 : 0));
          const updatedFile = sssFormat.addPuzzle(parsed, {
            title: puzzleName,
            grid: gridAsNumbers,
          }, "Designer");
          
          setSSSFile(updatedFile);
          sssFormat.download(updatedFile, file.name);
        } else {
          console.error("Invalid SSS file format");
        }
      }
    };
    reader.readAsText(file);
  }, [state.puzzleName, state.grid]);

  const statusInfo = controller.getStatusInfo(state);

  return (
    <PageContainer className="designer">
      <DesignerControls
        puzzleName={state.puzzleName}
        hasFilledCells={controller.hasFilledCells(state)}
        hasUniqueSolution={state.hasUniqueSolution === true}
        showDevTools={showDevTools}
        isSketchFormat={isSketchFormat}
        onNameChange={handleNameChange}
        onClear={handleClear}
        onExport={handleExport}
        onShare={handleShare}
        onSave={handleSave}
        saveStatus={saveStatus}
        shareStatus={shareStatus}
        exportStatus={exportStatus}
        onDownloadSSS={handleDownloadSSS}
        onUploadSSS={handleUploadSSS}
      />

      <div className="designer-grid-container">
        <NonogramGrid
          grid={state.grid}
          rowHints={state.rowHints}
          columnHints={state.columnHints}
          onCellClick={handleCellClick}
          onCellPointerDown={handlePointerDown}
          onCellPointerEnter={handlePointerEnter}
          minRowHintSlots={state.width}
          minColHintSlots={state.height}
        />
      </div>

      <SolutionStatus
        message={statusInfo.message}
        variant={statusInfo.variant}
        difficulty={statusInfo.difficulty}
      />

      <DesignerInfo />
    </PageContainer>
  );
}
