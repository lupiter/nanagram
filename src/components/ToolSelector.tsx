import { CellState } from "../types/nonogram";
import ToggleGroup from "./ToggleGroup";

interface ToolSelectorProps {
  tool: CellState;
  onToolChange: (tool: CellState) => void;
}

export default function ToolSelector({ tool, onToolChange }: ToolSelectorProps) {
  return (
    <div className="controls">
      <ToggleGroup
        value={tool}
        onChange={onToolChange}
        options={[
          { value: CellState.FILLED, label: "■", ariaLabel: "Fill" },
          { value: CellState.CROSSED_OUT, label: "✕︎", ariaLabel: "Cross" },
        ]}
        name="tool"
        title="Tool"
      />
    </div>
  );
}

