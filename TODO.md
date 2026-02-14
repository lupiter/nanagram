# TODO

Ordered plan for current issues and features.

## 1. Theming

- Add four themes:
  - **Light** – current colours (default).
  - **Dark** – dark theme.
  - **High-contrast dark** – white on black.
  - **High-contrast light** – black on white.
- Implement via CSS variables/tokens so theme can be switched at runtime.

## 2. Dark versions of all the icons

- Add dark-theme variants for every icon so they remain visible and on-brand on dark and high-contrast dark themes.

## 3. Settings component

- New component holding user settings:
  - **Play mode**: assisted vs free.
  - **Theme**: dark vs light, and standard vs high contrast.
- Show settings:
  - In a **popup** on all play screens.
  - **Inline** on the settings screen, above puzzle management.

## 4. Fix clue ticking

- Clue completion (ticking off) is wrong: sometimes too early, sometimes too late.
- Any time a square is filled or crossed, re-check all clues in that row and column have been ticked off appropriately
- Fix logic so clues are marked complete only when correct and fully satisfied.

## 5. Fix navigation when next set is empty

- When the user finishes the **last puzzle in a set** and the **next set has no puzzles**, skip that set.
- Currently the link can go to an invalid puzzle.

## 6. Assisted mode: allow un-fill

- In assisted mode, do not allow **un-filling** squares (they will be auto-corrected if wrong).
- Keep **un-cross** allowed, **except** when the row or column is completed (those crosses stay).

## 7. Load: autofill rows/columns with no clues

- When loading a puzzle, if a row or column has **no clues**, autofill that row/column with **crosses**.

## 8. Assisted mode: autofill full row/column clues

- **Assisted mode only**: if the clue for a row or column equals the puzzle size (e.g. 5 in 5×5, 15 in 15×15), autofill that row/column with **filled** squares.

## 9. Assisted mode: auto-add crosses at boundaries

- When the user has filled all cells for a clue and that block **abuts the end** of the row/column, auto-add a **cross** before/after as appropriate.
  - Example: clues `1,2`, last two cells in the row filled → add a cross **before** that block.
- When the user has filled a block that **abuts the start** and matches earlier clues, auto-add a cross after that block.
  - Example: clues `1,2,3`, first four cells filled (satisfying 1 and 2) → add a cross **after** that block.

---

## Other

- **Focus rings:** Hide the focus ring when a square is crossed (it looks weird). Show focus rings only when the user is using keyboard navigation (e.g. detect :focus-visible or pointer vs keyboard).
- Fix the issue with drag in rows.
- More starter puzzles.
