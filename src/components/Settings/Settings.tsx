import { useState, useCallback, useEffect } from "react";
import { GameMode } from "../../types/puzzle";
import ToggleGroup from "../ToggleGroup/ToggleGroup";
import {
  THEME_BASE_KEY,
  THEME_HIGH_CONTRAST_KEY,
  ThemeBase,
  PLAY_MODE_STORAGE_KEY,
  CELL_SIZE_STORAGE_KEY,
  applyTheme,
  applyCellSize,
  getStoredThemeBase,
  getStoredThemeHighContrast,
  getStoredCellSizeMultiplier,
  type CellSizeMultiplier,
} from "../../themeStorage";
import "./Settings.css";

interface SettingsProps {
  /** When provided (e.g. in play screen popup), called so the current game updates mode immediately */
  onPlayModeChange?: (mode: GameMode) => void;
}

function getStoredPlayMode(): GameMode {
  if (typeof localStorage === "undefined") return GameMode.Assisted;
  const stored = localStorage.getItem(PLAY_MODE_STORAGE_KEY);
  if (stored === GameMode.Free) return GameMode.Free;
  if (stored === GameMode.Correction) return GameMode.Correction;
  return GameMode.Assisted;
}

export default function Settings({ onPlayModeChange }: SettingsProps) {
  const [themeBase, setThemeBase] = useState<ThemeBase>(getStoredThemeBase);
  const [highContrast, setHighContrast] = useState<boolean>(getStoredThemeHighContrast);
  const [playMode, setPlayMode] = useState<GameMode>(getStoredPlayMode);
  const [cellSize, setCellSize] = useState<CellSizeMultiplier>(getStoredCellSizeMultiplier);

  // Sync from storage when component mounts or becomes visible (e.g. modal opened)
  useEffect(() => {
    setThemeBase(getStoredThemeBase());
    setHighContrast(getStoredThemeHighContrast());
    setPlayMode(getStoredPlayMode());
    setCellSize(getStoredCellSizeMultiplier());
  }, []);

  const handleThemeBaseChange = useCallback((value: ThemeBase) => {
    setThemeBase(value);
    localStorage.setItem(THEME_BASE_KEY, value);
    applyTheme();
  }, []);

  const handleHighContrastChange = useCallback((value: boolean) => {
    setHighContrast(value);
    localStorage.setItem(THEME_HIGH_CONTRAST_KEY, value ? "true" : "false");
    applyTheme();
  }, []);

  const handlePlayModeChange = useCallback(
    (value: GameMode) => {
      setPlayMode(value);
      localStorage.setItem(PLAY_MODE_STORAGE_KEY, value);
      onPlayModeChange?.(value);
    },
    [onPlayModeChange]
  );

  const handleCellSizeChange = useCallback((value: CellSizeMultiplier) => {
    setCellSize(value);
    localStorage.setItem(CELL_SIZE_STORAGE_KEY, String(value));
    applyCellSize();
  }, []);

  return (
    <div className="settings">
      <ToggleGroup
        name="play-mode"
        title="Play mode"
        value={playMode}
        onChange={handlePlayModeChange}
        options={[
          { value: GameMode.Free, label: "Free" },
          { value: GameMode.Correction, label: "Correction" },
          { value: GameMode.Assisted, label: "Assisted" },
        ]}
      />
      <ToggleGroup
        name="theme-base"
        title="Theme"
        value={themeBase}
        onChange={handleThemeBaseChange}
        options={[
          { value: "light" as ThemeBase, label: "Light" },
          { value: "dark" as ThemeBase, label: "Dark" },
          { value: "auto" as ThemeBase, label: "Auto" },
        ]}
      />
      <ToggleGroup
        name="high-contrast"
        title="High contrast"
        value={highContrast}
        onChange={handleHighContrastChange}
        options={[
          { value: false, label: "Off" },
          { value: true, label: "On" },
        ]}
      />
      <ToggleGroup
        name="grid-size"
        title="Grid size"
        value={cellSize}
        onChange={handleCellSizeChange}
        options={[
          { value: 3 as CellSizeMultiplier, label: "XS" },
          { value: 4 as CellSizeMultiplier, label: "S" },
          { value: 5 as CellSizeMultiplier, label: "M" },
          { value: 6 as CellSizeMultiplier, label: "L" },
          { value: 7 as CellSizeMultiplier, label: "XL" },
        ]}
      />
    </div>
  );
}
