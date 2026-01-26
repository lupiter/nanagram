import { CellState } from "../../types/nonogram";
import ToggleGroup from "../ToggleGroup/ToggleGroup";
import { Icons } from "../Icons/Icons";

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
          { value: CellState.FILLED, label: <Icons.FilledSquare />, ariaLabel: "Fill" },
          { value: CellState.CROSSED_OUT, label: <Icons.CrossMark />, ariaLabel: "Cross" },
        ]}
        name="tool"
        title="Tool"
      />
    </div>
  );
}

