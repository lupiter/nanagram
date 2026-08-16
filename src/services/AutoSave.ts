/**
 * AutoSave - Automatically saves puzzle progress to localStorage
 *
 * Saves progress at natural transition points to prevent data loss.
 * Includes a "Saved" indicator that can be displayed to users.
 */

export class AutoSave {
  private static instance: AutoSave;

  private readonly progressKeyPrefix = "nonogram-auto-save-";
  private readonly CURRENT_VERSION = 1;
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private saveDelayMs = 500; // Delay before auto-save (prevent excessive saves)

  /** Get the singleton instance */
  static getInstance(): AutoSave {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    AutoSave.instance ??= new AutoSave();
    return AutoSave.instance;
  }

  /** Check if we should auto-save (puzzle has content but is not solved) */
  shouldAutoSave(_category: string, _id: string, hasContent: boolean, isSolved: boolean): boolean {
    return hasContent && !isSolved;
  }

  /** Queue an auto-save operation with delay */
  queueAutoSave(
    _category: string,
    _id: string,
    grid: number[][],
    onSaved?: () => void,
  ): void {
    // Clear any existing timeout to prevent multiple saves
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    // Set new timeout
    this.saveTimeoutId = setTimeout(() => {
      this.performAutoSave(_category, _id, grid, onSaved);
      this.saveTimeoutId = null;
    }, this.saveDelayMs);
  }

  /** Perform the actual auto-save */
  private performAutoSave(
    _category: string,
    _id: string,
    grid: number[][],
    onSaved?: () => void,
  ): void {
    const key = `${this.progressKeyPrefix}${_category}-${_id}`;
    try {
      const data = {
        version: this.CURRENT_VERSION,
        grid,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Auto-saved progress for ${_category}-${_id}`);
      onSaved?.();
    } catch (error) {
      console.error("Failed to auto-save progress:", error);
    }
  }

  /** Load auto-saved progress (if available) */
  loadAutoSave(category: string, id: string): number[][] | null {
    const key = `${this.progressKeyPrefix}${category}-${id}`;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const data = JSON.parse(stored) as {
        version: number;
        grid: number[][];
        timestamp: number;
      };

      // Validate version
      if (data.version !== this.CURRENT_VERSION) {
        console.warn(
          `Auto-save version mismatch for ${category}-${id}: expected ${this.CURRENT_VERSION}, got ${data.version}. Skipping load.`,
        );
        return null;
      }

      return data.grid;
    } catch (error) {
      console.error("Failed to load auto-saved progress:", error);
      return null;
    }
  }

  /** Clear auto-saved progress */
  clearAutoSave(category: string, id: string): void {
    const key = `${this.progressKeyPrefix}${category}-${id}`;
    localStorage.removeItem(key);
  }

  /** Check if auto-saved data exists */
  hasAutoSave(category: string, id: string): boolean {
    return !!this.loadAutoSave(category, id);
  }

  /** Get all auto-save keys (for cleanup) */
  getAllAutoSaveKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.progressKeyPrefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /** Clean up old auto-save data (optional) */
  cleanupOldSaves(olderThanDays: number): void {
    const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const allKeys = this.getAllAutoSaveKeys();

    allKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (!stored) return;

        const data = JSON.parse(stored);
        const timestamp = data.timestamp || 0;

        if (timestamp < cutoffDate) {
          localStorage.removeItem(key);
          console.log(`Cleaned up old auto-save: ${key}`);
        }
      } catch (error) {
        console.error("Failed to clean up auto-save:", error);
      }
    });
  }
}

/** Convenience export for the singleton instance */
export const autoSave = AutoSave.getInstance();
