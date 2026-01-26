import { Hint, CellState } from "../types/nonogram";
import { hintChecker } from "../services/HintChecker";

describe("checkHints", () => {
  describe("when all hints are used and answered correctly", () => {
    it("when everything is empty", () => {
      const answer = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [];
  
      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(0);
    });

    it("when everything is filled", () => {
      const answer = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 3, used: false },
      ];
  
      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (start)", () => {
      const answer = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 2, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (end)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 2, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (middle)", () => {
      const answer = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(2);
      expect(result[0].used).toBe(true);
      expect(result[1].used).toBe(true);
    });


    it("two empty, one filled (start)", () => {
      const answer = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (end)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (middle)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });
  });

  describe("when hints are used but not answered correctly", () => {
    it("when everything is empty", () => {
      const answer = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [];
  
      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(0);
    });

    it("when everything is filled", () => {
      const answer = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 3, used: false },
      ];
  
      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (start)", () => {
      const answer = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 2, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (end)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 2, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (middle)", () => {
      const answer = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(2);
      expect(result[0].used).toBe(false);
      expect(result[1].used).toBe(false);
    });


    it("two empty, one filled (start)", () => {
      const answer = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two empty, one filled (end)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two empty, one filled (middle)", () => {
      const answer = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });
  });


  it("should mark hints as used when they match filled sequences and answer", () => {
    const cells = [
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: true },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
  });

  it("should mark hints as used when they match filled sequences and answer", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
  });

  it("should only mark hints that match their position and answer", () => {
    const cells = [
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
  });

  it("should not mark hints if sequences are too short", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const answer = [
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(false);
  });

  it("should handle already used hints", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 1, used: true },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
  });

  it("should not mark hints if they don't match the answer", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const answer = [
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(false);
  });

  it("should tick off the first hint if the answer is filled, even if the second hint has not been answered yet", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.EMPTY
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(false);
  });

  it("should tick off the second hint if only that answer is filled, even if the first hint has not been answered yet", () => {
    const cells = [
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
  });
}); 