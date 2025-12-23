import { useCallback } from "react";
import { useDesigner } from "../hooks/useDesigner";
import NonogramGrid from "../components/NonogramGrid";
import DesignerControls from "../components/DesignerControls";
import SolutionStatus from "../components/SolutionStatus";
import DesignerInfo from "../components/DesignerInfo";
import "./Designer.css";

export default function Designer() {
  const { state, setState, controller } = useDesigner();

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setState(s => controller.toggleCell(s, row, col));
    },
    [controller, setState]
  );

  const handleNameChange = useCallback(
    (name: string) => {
      setState(s => controller.setPuzzleName(s, name));
    },
    [controller, setState]
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      setState(s => controller.setSize(s, size));
    },
    [controller, setState]
  );

  const handleClear = useCallback(() => {
    setState(s => controller.clear(s));
  }, [controller, setState]);

  const handleExport = useCallback(() => {
    const json = controller.exportJson(state);
    navigator.clipboard.writeText(json).catch((err) => {
      console.error("Failed to copy:", err);
    });
  }, [controller, state]);

  const statusInfo = controller.getStatusInfo(state);

  return (
    <div className="designer">
      <h1>Puzzle Designer</h1>

      <DesignerControls
        puzzleName={state.puzzleName}
        size={state.size}
        hasFilledCells={controller.hasFilledCells(state)}
        onNameChange={handleNameChange}
        onSizeChange={handleSizeChange}
        onClear={handleClear}
        onExport={handleExport}
      />

      <SolutionStatus message={statusInfo.message} className={statusInfo.className} />

      <div className="designer-grid-container">
        <NonogramGrid
          grid={state.grid}
          rowHints={state.rowHints}
          columnHints={state.columnHints}
          onCellClick={handleCellClick}
        />
      </div>

      <DesignerInfo />
    </div>
  );
}
