# Quickstart: Web Calculator

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

How to run the feature locally and confirm it satisfies the spec once implemented. This guide assumes the standard Vite scaffolding from `plan.md` (`package.json`, `vite.config.ts`, `tsconfig.json`) exists on this branch.

## Prerequisites

- Node.js (LTS) and npm installed.
- On branch `001-web-calculator`, dependencies installed once via:

```bash
npm install
```

## Run the app

```bash
npm run dev
```

Open the printed local URL. You should see a calculator with a display showing `0` and buttons for digits `0`-`9`, `+`, `-`, `×`, `÷`, `%`, `=`, clear-entry, clear-all, and delete-last-digit.

## Run the automated tests

```bash
npm run test        # Vitest: domain-engine unit tests + component tests
```

All tests should pass before considering the feature done — in particular the domain-engine tests covering every edge case in spec.md (divide-by-zero, digit cap, repeated operators/equals, decimal handling).

## Manual validation checklist

Walk through each user story from spec.md directly in the running app:

1. **Basic calculation (User Story 1)** — Click `1`, `2`, `+`, `7`, `=`. Display should read `19`. Repeat for `-`, `×`, `÷` per spec Acceptance Scenarios.
2. **Correcting mistakes (User Story 2)** — Type `123`, press delete-last-digit → display reads `12`. Start a new operation (`45`, `+`), press clear-entry → display resets to `0` but the pending `+` is preserved (verify by then typing `5`, `=` → `50`). Press clear-all mid-calculation → display and pending operator both reset.
3. **Percentage (User Story 3)** — Type `50`, press `%` → display reads `0.5`. Type `200`, `+`, `10`, `%` → display reads `20` (the amount added), and pressing `=` afterward yields `220`.
4. **Keyboard parity (User Story 4)** — Using only the keyboard: type `1`, `2`, `+`, `7`, press `Enter` → `19`. Press `Backspace` on a typed number → last digit removed. Press `Escape` → full reset. Type `6`, `*`, `7`, press `=` (not Enter) → `42`.
5. **Resilience (Edge Cases)** — Divide by zero (`5`, `÷`, `0`, `=`) → display reads `N/A`, and pressing a digit afterward starts a fresh entry rather than staying stuck. Type 11 digits in a row → the 11th is ignored, or trigger a result over 10 digits (e.g. a large multiplication) → display reads `exceeded the max digits`. Press `+` twice in a row, then a number, then `=` → behaves as a single `+`.
6. **Phone-sized layout** — Resize the browser (or use device emulation) to 320px and 375px wide. Every button and the display should remain visible, correctly sized for touch, with no horizontal scrolling, overlap, or clipped text (spec FR-012/FR-014/SC-005).
7. **Keyboard focus visibility** — Tab through the on-screen buttons; each one should show a clearly visible focus outline (spec FR-015).

If every step above matches its expected outcome, the feature meets spec.md's Success Criteria.
