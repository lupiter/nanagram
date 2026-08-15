import { useEffect, useState } from "react";
import { Icons } from "../Icons/Icons";
import "./SavedIndicator.css";

interface SavedIndicatorProps {
  category: string;
  id: string;
}

export default function SavedIndicator({ category, id }: SavedIndicatorProps) {
  const [saved, setSaved] = useState(false);

  // Auto-save on mount
  useEffect(() => {
    // Check if auto-save exists
    const autoSaveKey = `nonogram-auto-save-${category}-${id}`;
    const savedAutoSave = localStorage.getItem(autoSaveKey);
    if (savedAutoSave) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [category, id]);

  if (!saved) return null;

  return (
    <div className="saved-indicator" role="status" aria-live="polite">
      <Icons.Check />
      <span>Saved</span>
    </div>
  );
}
