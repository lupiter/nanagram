import { useCallback, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDesigner } from "../hooks/useDesigner";
import { usePageTitle } from "../hooks/usePageTitle";
import NonogramGrid from "../components/NonogramGrid";
import DesignerControls from "../components/DesignerControls";
import SolutionStatus from "../components/SolutionStatus";
import DesignerInfo from "../components/DesignerInfo";
import "./Designer.css";

const VALID_SIZES = [5, 10, 15, 20, 25];

export default function Designer() {
  const { size: sizeParam } = useParams<{ size: string }>();
  const size = VALID_SIZES.includes(Number(sizeParam)) ? Number(sizeParam) : 5;
  const [searchParams] = useSearchParams();
  const showDevTools = searchParams.get("dev") === "true";
  const { state, setState, controller } = useDesigner(size);
  const { setTitle } = usePageTitle();

  useEffect(() => {
    document.title = "Designer - Nanna Gram";
    setTitle({ title: "Designer", subtitle: `${String(state.size)}×${String(state.size)}` });
  }, [setTitle, state.size]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Skip if already handled by drag start
      setState((s) => {
        if (s.isDragging && (s.draggedCells.get(row)?.has(col) ?? false)) {
          return s;
        }
        return controller.toggleCell(s, row, col);
      });
    },
    [controller, setState]
  );

  const handleMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (e.button === 2) return; // Ignore right click
      setState((s) => controller.startDrag(s, row, col));
    },
    [controller, setState]
  );

  const handleMouseEnter = useCallback(
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
    navigator.clipboard.writeText(json).catch((err: unknown) => {
      console.error("Failed to copy:", err);
    });
  }, [controller, state]);

  const handleShare = useCallback(() => {
    const url = controller.getShareUrl(state);
    navigator.clipboard.writeText(url).catch((err: unknown) => {
      console.error("Failed to copy:", err);
    });
  }, [controller, state]);

  const statusInfo = controller.getStatusInfo(state);

  return (
    <div className="designer">
      <DesignerControls
        puzzleName={state.puzzleName}
        hasFilledCells={controller.hasFilledCells(state)}
        hasUniqueSolution={state.hasUniqueSolution === true}
        showDevTools={showDevTools}
        onNameChange={handleNameChange}
        onClear={handleClear}
        onExport={handleExport}
        onShare={handleShare}
      />

      <div className="designer-grid-container">
        <NonogramGrid
          grid={state.grid}
          rowHints={state.rowHints}
          columnHints={state.columnHints}
          onCellClick={handleCellClick}
          onCellMouseDown={handleMouseDown}
          onCellMouseEnter={handleMouseEnter}
        />
      </div>

      <SolutionStatus
        message={statusInfo.message}
        className={statusInfo.className}
        difficulty={statusInfo.difficulty}
      />

      <DesignerInfo />
    </div>
  );
}
