import { GameMode } from "../types/puzzle";
import ToggleGroup from "./ToggleGroup";

interface ModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="controls">
      <ToggleGroup
        value={mode}
        onChange={onModeChange}
        options={[
          { value: GameMode.Free, label: "Free" },
          { value: GameMode.Assisted, label: "Assisted" },
        ]}
        name="mode"
        title="Game Mode"
      />
    </div>
  );
}

