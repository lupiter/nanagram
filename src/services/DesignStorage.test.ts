import { DesignStorage } from "./DesignStorage";
import { CellState, PuzzleSolutionData } from "../types/nonogram";

describe("DesignStorage", () => {
  let storage: DesignStorage;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    // Create fresh instance and mock localStorage for each test
    storage = new DesignStorage();
    mockStorage = {};

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      return mockStorage[key] ?? null;
    });

    jest.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });

    jest.spyOn(Storage.prototype, "removeItem").mockImplementation((key: string) => {
      mockStorage[key] = undefined as unknown as string;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createTestSolution = (): PuzzleSolutionData => [
    [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
    [CellState.EMPTY, CellState.FILLED, CellState.EMPTY],
    [CellState.FILLED, CellState.EMPTY, CellState.FILLED],
  ];

  describe("save", () => {
    it("should save a design and return it with an id", () => {
      const design = {
        name: "Test Design",
        height: 3,
        width: 3,
        difficulty: 2,
        solution: createTestSolution(),
      };

      const saved = storage.save(design);

      expect(saved.id).toBeDefined();
      expect(saved.name).toBe("Test Design");
      expect(saved.createdAt).toBeDefined();
    });

    it("should persist to localStorage", () => {
      const design = {
        name: "Persist Test",
        height: 3,
        width: 3,
        difficulty: 1,
        solution: createTestSolution(),
      };

      storage.save(design);

      expect(mockStorage["nonogram-designs"]).toBeDefined();
      const stored = JSON.parse(mockStorage["nonogram-designs"]) as unknown[];
      expect(stored.length).toBe(1);
    });
  });

  describe("getAll", () => {
    it("should return empty array when no designs exist", () => {
      const designs = storage.getAll();

      expect(designs).toEqual([]);
    });

    it("should return all saved designs", () => {
      storage.save({ name: "Design 1", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });
      storage.save({ name: "Design 2", height: 3, width: 3, difficulty: 2, solution: createTestSolution() });

      const designs = storage.getAll();

      expect(designs.length).toBe(2);
    });
  });

  describe("getById", () => {
    it("should return a design by its id", () => {
      const saved = storage.save({ name: "Find Me", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });

      const found = storage.getById(saved.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe("Find Me");
    });

    it("should return undefined for non-existent id", () => {
      const found = storage.getById("non-existent-id");

      expect(found).toBeNull();
    });
  });

  describe("delete", () => {
    it("should remove a design by id", () => {
      const saved = storage.save({ name: "Delete Me", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });

      storage.delete(saved.id);

      expect(storage.getById(saved.id)).toBeNull();
    });

    it("should not affect other designs", () => {
      const design1 = storage.save({ name: "Keep", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });
      const design2 = storage.save({ name: "Delete", height: 3, width: 3, difficulty: 2, solution: createTestSolution() });

      storage.delete(design2.id);

      expect(storage.getById(design1.id)).toBeDefined();
      expect(storage.getAll().length).toBe(1);
    });
  });

  describe("update", () => {
    it("should update an existing design", () => {
      const saved = storage.save({ name: "Original", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });

      storage.update(saved.id, { name: "Updated" });

      const updated = storage.getById(saved.id);
      expect(updated?.name).toBe("Updated");
    });

    it("should preserve unchanged fields", () => {
      const saved = storage.save({ name: "Original", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });

      storage.update(saved.id, { difficulty: 5 });

      const updated = storage.getById(saved.id);
      expect(updated?.name).toBe("Original");
      expect(updated?.difficulty).toBe(5);
    });
  });

  describe("findDuplicate", () => {
    it("should find a design with matching solution", () => {
      const solution = createTestSolution();
      storage.save({ name: "Original", height: 3, width: 3, difficulty: 1, solution });

      const duplicate = storage.findDuplicate(solution);

      expect(duplicate).toBeDefined();
      expect(duplicate?.name).toBe("Original");
    });

    it("should return null when no duplicate exists", () => {
      const solution1 = createTestSolution();
      storage.save({ name: "Original", height: 3, width: 3, difficulty: 1, solution: solution1 });

      const differentSolution: PuzzleSolutionData = [
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
        [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY],
      ];

      const duplicate = storage.findDuplicate(differentSolution);

      expect(duplicate).toBeNull();
    });
  });

  describe("exportAsJson", () => {
    it("should return a JSON string of all designs", () => {
      storage.save({ name: "Export 1", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });
      storage.save({ name: "Export 2", height: 3, width: 3, difficulty: 2, solution: createTestSolution() });

      const json = storage.exportAsJson();
      const parsed = JSON.parse(json) as { designs: unknown[] };

      expect(parsed.designs.length).toBe(2);
    });
  });

  describe("parseExportedJson", () => {
    it("should parse valid exported JSON", () => {
      storage.save({ name: "Test", height: 3, width: 3, difficulty: 1, solution: createTestSolution() });
      const json = storage.exportAsJson();

      const parsed = storage.parseExportedJson(json);

      expect(parsed).toBeDefined();
      expect(parsed?.length).toBe(1);
    });

    it("should return null for invalid JSON", () => {
      const parsed = storage.parseExportedJson("not valid json");

      expect(parsed).toBeNull();
    });

    it("should return null for non-array JSON", () => {
      const parsed = storage.parseExportedJson('{"foo": "bar"}');

      expect(parsed).toBeNull();
    });
  });

  describe("import", () => {
    it("should import designs and report counts", () => {
      const designs = [
        { id: "1", name: "Import 1", height: 3, width: 3, difficulty: 1, solution: createTestSolution(), createdAt: new Date().toISOString() },
        { id: "2", name: "Import 2", height: 3, width: 3, difficulty: 2, solution: createTestSolution(), createdAt: new Date().toISOString() },
      ];

      const result = storage.import(designs, false);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(storage.getAll().length).toBe(2);
    });

    it("should skip duplicates when deduplication is enabled", () => {
      const solution = createTestSolution();
      storage.save({ name: "Existing", height: 3, width: 3, difficulty: 1, solution });

      const designs = [
        { id: "1", name: "Duplicate", height: 3, width: 3, difficulty: 1, solution, createdAt: new Date().toISOString() },
      ];

      const result = storage.import(designs, true);

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });
});
