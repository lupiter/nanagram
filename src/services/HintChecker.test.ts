import { CellState, Hint } from "../types/nonogram";
import { hintChecker } from "../services/HintChecker";

describe("checkHints (Strict Sealing Rules)", () => {
  describe("when all hints are used and answered correctly (Sealed)", () => {
    it("when everything is empty", () => {
      const answer = [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY];
      const hints: Hint[] = [];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(0);
    });

    it("when everything is filled (Bounded by edges)", () => {
      const answer = [CellState.FILLED, CellState.FILLED, CellState.FILLED];
      const hints: Hint[] = [{ hint: 3, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (start) - not sealed, but complete", () => {
      const answer = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (start) - SEALED", () => {
      const answer = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.CROSSED_OUT,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (end) - not sealed, but complete", () => {
      const answer = [CellState.EMPTY, CellState.FILLED, CellState.FILLED];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (end) - SEALED", () => {
      const answer = [
        CellState.CROSSED_OUT,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two filled, one empty (middle) - not sealed, but complete", () => {
      const answer = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
      const hints: Hint[] = [
        { hint: 1, used: false },
        { hint: 1, used: false },
      ];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(2);
      expect(result[0].used).toBe(true);
      expect(result[1].used).toBe(true);
    });

    it("two filled, one empty (middle) - SEALED", () => {
      const answer = [
        CellState.FILLED,
        CellState.CROSSED_OUT,
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

    it("two empty, one filled (start) - not sealed, but complete", () => {
      const answer = [CellState.FILLED, CellState.EMPTY, CellState.EMPTY];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (start) - SEALED", () => {
      const answer = [CellState.FILLED, CellState.CROSSED_OUT, CellState.EMPTY];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (end) - not sealed, but complete", () => {
      const answer = [CellState.EMPTY, CellState.EMPTY, CellState.FILLED];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (end) - SEALED", () => {
      const answer = [CellState.EMPTY, CellState.CROSSED_OUT, CellState.FILLED];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (middle) - not sealed, but complete", () => {
      const answer = [CellState.EMPTY, CellState.FILLED, CellState.EMPTY];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });

    it("two empty, one filled (middle) - SEALED", () => {
      const answer = [
        CellState.CROSSED_OUT,
        CellState.FILLED,
        CellState.CROSSED_OUT,
      ];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(answer, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(true);
    });
  });

  describe("when hints are used but not answered correctly (Unsealed or Wrong)", () => {
    it("when everything is empty", () => {
      const answer = [CellState.EMPTY, CellState.EMPTY, CellState.EMPTY];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(0);
    });

    it("when everything is filled (but wrong sequence)", () => {
      const answer = [CellState.FILLED, CellState.FILLED, CellState.FILLED];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 3, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (start), incorrect - NOT SEALED", () => {
      const answer = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (start), incorrect - SEALED", () => {
      const answer = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
      const cells: CellState[] = [
        CellState.CROSSED_OUT,
        CellState.FILLED,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (end) - NOT SEALED", () => {
      const answer = [CellState.EMPTY, CellState.FILLED, CellState.FILLED];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    
    it("two filled, one empty (end), incorccect - SEALED", () => {
      const answer = [CellState.EMPTY, CellState.FILLED, CellState.FILLED];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.CROSSED_OUT,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 2, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two filled, one empty (middle) - NOT SEALED", () => {
      const answer = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
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

    
    it("two filled, one empty (middle), incorrect - SEALED", () => {
      const answer = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.FILLED,
        CellState.CROSSED_OUT,
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

    it("two empty, one filled (start) - NOT SEALED", () => {
      const answer = [CellState.FILLED, CellState.EMPTY, CellState.EMPTY];
      const cells: CellState[] = [
        CellState.EMPTY,
        CellState.EMPTY,
        CellState.FILLED,
      ];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two empty, one filled (end) - NOT SEALED", () => {
      const answer = [CellState.EMPTY, CellState.EMPTY, CellState.FILLED];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });

    it("two empty, one filled (middle) - NOT SEALED", () => {
      const answer = [CellState.EMPTY, CellState.FILLED, CellState.EMPTY];
      const cells: CellState[] = [
        CellState.FILLED,
        CellState.EMPTY,
        CellState.EMPTY,
      ];
      const hints: Hint[] = [{ hint: 1, used: false }];

      const result = hintChecker.check(cells, hints, answer);
      expect(result.length).toBe(1);
      expect(result[0].used).toBe(false);
    });
  });

  it("recomputes used from scratch so only the matching hint is marked when one was already used", () => {
    const cells = [CellState.FILLED, CellState.CROSSED_OUT, CellState.FILLED];
    const answer = [CellState.FILLED, CellState.EMPTY, CellState.FILLED];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: true },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
  });

  it("should only mark hints that match their position and answer", () => {
    const cells = [CellState.EMPTY, CellState.CROSSED_OUT, CellState.FILLED];
    const answer = [CellState.FILLED, CellState.CROSSED_OUT, CellState.FILLED];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
  });

  it("should not mark hints if sequences are too short", () => {
    const cells = [CellState.FILLED, CellState.CROSSED_OUT, CellState.EMPTY];
    const answer = [CellState.FILLED, CellState.FILLED, CellState.EMPTY];
    const hints = [
      { hint: 2, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result.length).toBe(1);
    expect(result[0].used).toBe(false);
  });

  it("should not mark hints if they don't match the answer", () => {
    const cells = [CellState.FILLED, CellState.CROSSED_OUT, CellState.FILLED];
    const answer = [CellState.EMPTY, CellState.FILLED, CellState.EMPTY];
    const hints = [{ hint: 1, used: false }];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
  });

  it("should NOT tick off the first hint if it is not sealed", () => {
    const cells = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.EMPTY,
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
    expect(result[1].used).toBe(false);
  });

  it("should NOT tick off a middle hint when the sequence could match multiple hints and row has empties", () => {
    // With hints [1, 1], a sequence at position 2 could be either hint; there are empties on both sides.
    const cells = [
      CellState.EMPTY,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.EMPTY,
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
    expect(result[1].used).toBe(false);
  });

  it("should tick off a unique hint when found, even in the middle", () => {
    // With hints [1, 2, 1], if we find a sequence of 2, it can only be the middle hint
    const cells = [
      CellState.EMPTY,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.EMPTY,
    ];
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 2, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
    expect(result[2].used).toBe(false);
  });

  it("should mark both hints as used when two filled blocks of 1 match the answer and are sealed", () => {
    const answer = [
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const cells = [
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.EMPTY,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
  });

  it("should mark the single hint as used when the one filled block matches the answer and is sealed", () => {
    const answer = [
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const cells = [
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.CROSSED_OUT,
    ];
    const hints = [{ hint: 1, used: false }];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
  });

  it("should mark neither hint as used when one middle block could match either of two 1s and is not sealed", () => {
    // Answer has blocks at 2 and 4. User filled only the block at 2; empties on both sides so not pinned.
    const answer = [
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
    ];
    const cells = [
      CellState.EMPTY,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.EMPTY,
      CellState.EMPTY,
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

  it("should mark all hints when the line has no empty cells", () => {
    const answer = [
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const cells = [
      CellState.FILLED,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.CROSSED_OUT,
    ];
    const hints = [
      { hint: 2, used: false },
      { hint: 1, used: false },
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
    expect(result[2].used).toBe(true);
    expect(result[3].used).toBe(true);
  });

  it("should mark only the first hint as used when the single filled block matches the first clue's position and is sealed", () => {
    const answer = [
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.EMPTY,
    ];
    const cells = [
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.CROSSED_OUT,
    ];
    const hints = [
      { hint: 1, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(true);
    expect(result[1].used).toBe(true);
  });

  it("should mark hits when propery sealed", () => {
    const answer = [
      CellState.EMPTY,
      CellState.FILLED,
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.EMPTY,
      CellState.FILLED,
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.FILLED,
    ];
    const cells = [
      CellState.EMPTY,
      CellState.FILLED,
      CellState.FILLED,
      CellState.EMPTY,
      CellState.CROSSED_OUT,
      CellState.FILLED,
      CellState.FILLED,
      CellState.FILLED,
      CellState.CROSSED_OUT,
      CellState.FILLED,
    ];
    const hints = [
      { hint: 3, used: false },
      { hint: 3, used: false },
      { hint: 1, used: false },
    ];

    const result = hintChecker.check(cells, hints, answer);
    expect(result[0].used).toBe(false);
    expect(result[1].used).toBe(true);
    expect(result[2].used).toBe(true);
  });
});
