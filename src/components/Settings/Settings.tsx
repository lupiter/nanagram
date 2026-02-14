import { useState, useCallback, useEffect } from "react";
import { GameMode } from "../../types/puzzle";
import ToggleGroup from "../ToggleGroup/ToggleGroup";
import {
  THEME_BASE_KEY,
  THEME_HIGH_CONTRAST_KEY,
  ThemeBase,
  PLAY_MODE_STORAGE_KEY,
  applyTheme,
  getStoredThemeBase,
  getStoredThemeHighContrast,
} from "../../themeStorage";
import "./Settings.css";

interface SettingsProps {
  /** When provided (e.g. in play screen popup), called so the current game updates mode immediately */
  onPlayModeChange?: (mode: GameMode) => void;
}

function getStoredPlayMode(): GameMode {
  if (typeof localStorage === "undefined") return GameMode.Assisted;
  const stored = localStorage.getItem(PLAY_MODE_STORAGE_KEY);
  return stored === GameMode.Free ? GameMode.Free : GameMode.Assisted;
}

export default function Settings({ onPlayModeChange }: SettingsProps) {
  const [themeBase, setThemeBase] = useState<ThemeBase>(getStoredThemeBase);
  const [highContrast, setHighContrast] = useState<boolean>(getStoredThemeHighContrast);
  const [playMode, setPlayMode] = useState<GameMode>(getStoredPlayMode);

  // Sync from storage when component mounts or becomes visible (e.g. modal opened)
  useEffect(() => {
    setThemeBase(getStoredThemeBase());
    setHighContrast(getStoredThemeHighContrast());
    setPlayMode(getStoredPlayMode());
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

  return (
    <div className="settings">
      <ToggleGroup
        name="play-mode"
        title="Play mode"
        value={playMode}
        onChange={handlePlayModeChange}
        options={[
          { value: GameMode.Free, label: "Free" },
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
    </div>
  );
}
