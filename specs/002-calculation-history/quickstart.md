# Quickstart: Calculation History

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

How to run the feature locally and confirm it satisfies the spec once implemented. Builds on the same Vite scaffolding as round 1 (`001-web-calculator`) — no new setup steps.

## Prerequisites

- Node.js (LTS) and npm installed.
- On branch `002-calculation-history`, dependencies installed once via:

```bash
npm install
```

## Run the app

```bash
npm run dev
```

Open the printed local URL. You should see the same calculator as round 1 (display + keypad), plus a new history toggle control. The keypad's appearance and behavior should be pixel-for-pixel unchanged from round 1 when the history panel is closed.

## Run the automated tests

```bash
npm run test        # Vitest: domain-engine unit tests (calculator.* unchanged, history.* new) + component tests
```

All tests should pass, including round 1's existing `calculator.test.ts`/`keymap.test.ts` with **zero changes** — if either of those files needed edits to make this feature work, something has leaked into the engine and the Constitution Check in `plan.md` has been violated.

## Manual validation checklist

Walk through each user story from spec.md directly in the running app.

1. **Round 1 is unaffected** — Before touching history at all, run through round 1's own quickstart steps (basic arithmetic, clear-entry/clear-all/backspace, percentage, keyboard parity, divide-by-zero → `N/A`, 320–375px layout). Every one of them must still behave exactly as before this feature existed (spec FR-010).
2. **Review recent calculations (User Story 1)**:
   - Open the history toggle with no calculations yet performed → empty state, no error.
   - Compute `12 + 7 =` then `6 × 7 =`. Open history → both appear, `6 × 7 = 42` listed above `12 + 7 = 19` (most recent first).
   - Compute 4 more calculations (6 total). Open history → only the 5 most recent are shown; the very first one is gone.
   - Divide by zero (`5 ÷ 0 =`, → `N/A`). Open history → this entry does **not** appear.
3. **Reuse a past calculation (User Story 2)**:
   - With `12 + 7 = 19` in history, select that entry → display shows `19`.
   - Start a fresh in-progress calculation (`45`, `+`), then select a history entry showing `19` → the `45 +` in progress is discarded; display shows `19`.
   - After reusing an entry, press `+`, `3`, `=` → proceeds normally (e.g. `19 + 3 = 22`), and `22` itself now appears at the top of history.
   - Confirm selecting an entry never removes or reorders it in the list.
4. **Clear the history list (User Story 3)**:
   - With several entries present, trigger Clear → history view shows the empty state immediately.
   - Compute one new calculation → it appears as the sole entry.
   - Trigger Clear again on an already-empty list → no error, no change.
   - Trigger Clear while a calculation is in progress (e.g. `45 +` typed) → history empties, but the in-progress `45 +` calculation on the main display is untouched.
5. **Small-screen behavior (Edge Cases, FR-008)** — Resize the browser (or use device emulation) to 375px, then 320px:
   - With history closed, the keypad occupies exactly the same layout as round 1 at these widths.
   - Open the history overlay/drawer — no keypad button moves, resizes, or becomes unreachable; the overlay sits behind/above the keypad rather than pushing it.
   - Close the overlay — keypad layout is unchanged from before it opened.
6. **Reload resets history (FR-009, SC-006)** — With entries present, reload the page → history is empty and the active calculation is back to `0`, with no leftover state from before the reload.
7. **Keyboard focus visibility** — Tab to the history toggle; it should show a clearly visible focus outline, consistent with round 1's other controls (constitution Principle IV).

If every step above matches its expected outcome, the feature meets spec.md's Success Criteria without regressing any of round 1's.
