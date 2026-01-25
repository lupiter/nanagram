/**
 * DesignStorage - Manages saved puzzle designs in localStorage
 * 
 * Singleton for CRUD operations on user-created puzzle designs.
 */

import { PuzzleSolutionData } from "../types/nonogram";
import { SavedDesign, ImportResult } from "../types/design";

// Re-export types for convenience
export type { SavedDesign, ImportResult };

export class DesignStorage {
  private static instance: DesignStorage;
  private readonly storageKey = "nonogram-designs";

  /** Get the singleton instance */
  static getInstance(): DesignStorage {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    DesignStorage.instance ??= new DesignStorage();
    return DesignStorage.instance;
  }

  /** Generate a unique ID for designs */
  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Persist designs to localStorage */
  private persist(designs: SavedDesign[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(designs));
  }

  /** Get all saved designs */
  getAll(): SavedDesign[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data) as SavedDesign[];
    } catch {
      console.error("Failed to load saved designs");
      return [];
    }
  }

  /** Get a single design by ID */
  getById(id: string): SavedDesign | null {
    const designs = this.getAll();
    return designs.find(d => d.id === id) ?? null;
  }

  /** Save a new design (returns the saved design with ID) */
  save(design: Omit<SavedDesign, "id" | "createdAt">): SavedDesign {
    const designs = this.getAll();
    const newDesign: SavedDesign = {
      ...design,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    designs.push(newDesign);
    this.persist(designs);
    return newDesign;
  }

  /** Update an existing design */
  update(id: string, updates: Partial<Omit<SavedDesign, "id" | "createdAt">>): SavedDesign | null {
    const designs = this.getAll();
    const index = designs.findIndex(d => d.id === id);
    if (index === -1) return null;

    designs[index] = { ...designs[index], ...updates };
    this.persist(designs);
    return designs[index];
  }

  /** Delete a design by ID */
  delete(id: string): boolean {
    const designs = this.getAll();
    const filtered = designs.filter(d => d.id !== id);
    if (filtered.length === designs.length) return false;

    this.persist(filtered);
    return true;
  }

  /** Find a design with the same solution (for deduplication) */
  findDuplicate(solution: PuzzleSolutionData): SavedDesign | null {
    const designs = this.getAll();
    const solutionStr = JSON.stringify(solution);
    return designs.find(d => JSON.stringify(d.solution) === solutionStr) ?? null;
  }

  /** Import designs with optional deduplication */
  import(newDesigns: SavedDesign[], deduplicate = true): ImportResult {
    const existing = this.getAll();
    let imported = 0;
    let skipped = 0;

    for (const design of newDesigns) {
      if (deduplicate) {
        const solutionStr = JSON.stringify(design.solution);
        const isDuplicate = existing.some(d => JSON.stringify(d.solution) === solutionStr);
        if (isDuplicate) {
          skipped++;
          continue;
        }
      }

      // Generate new ID for imported design
      const importedDesign: SavedDesign = {
        ...design,
        id: this.generateId(),
        createdAt: design.createdAt || new Date().toISOString(),
      };
      existing.push(importedDesign);
      imported++;
    }

    this.persist(existing);
    return { imported, skipped };
  }

  /** Export all designs as JSON string */
  exportAsJson(): string {
    const designs = this.getAll();
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      designs,
    }, null, 2);
  }

  /** Parse exported JSON and return designs */
  parseExportedJson(json: string): SavedDesign[] | null {
    try {
      const data = JSON.parse(json) as { version?: number; designs?: SavedDesign[] };
      if (data.version === 1 && Array.isArray(data.designs)) {
        return data.designs;
      }
      // Maybe it's just a raw array of designs
      if (Array.isArray(data)) {
        return data as SavedDesign[];
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Clear all designs (use with caution!) */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  /** Download designs as a file */
  download(filename = "my-designs.json"): void {
    const json = this.exportAsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/** Convenience export for the singleton instance */
export const designStorage = DesignStorage.getInstance();
