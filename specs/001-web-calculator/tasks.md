# Tasks: Web Calculator

**Input**: Design documents from `/specs/001-web-calculator/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Tests**: Included and required — the constitution's Test-First Development principle and the requester's explicit instruction both require domain-engine tests to be written and failing before the corresponding engine code is implemented.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1-US4); Setup, Foundational, and Polish tasks carry no story label
- Every task names its exact file path(s)

## Path Conventions

Single frontend project per plan.md's Structure Decision — `src/` at the repository root, tests co-located next to the source they cover (`*.test.ts(x)`), no separate `tests/` tree.

---

## Phase 1: Setup

**Purpose**: Get a running, testable Vite + React + TypeScript project on disk.

- [ ] T001 Scaffold the Vite + React + TypeScript (strict) project: `index.html`, `vite.config.ts`, `tsconfig.json` (`"strict": true`), `package.json` (react, react-dom, vite deps), `src/main.tsx`, and a placeholder `src/App.tsx` that renders "Calculator"
- [ ] T002 Add Vitest + React Testing Library: test config (in `vite.config.ts` or `vitest.config.ts`), a test setup file, and `dev`/`build`/`test` scripts in `package.json` (depends on T001)
- [ ] T003 [P] Create the design-token stylesheet `src/styles/tokens.css` with color tokens (including a ≥4.5:1-contrast text/background pair and a visible focus-ring color), a spacing scale, border-radius, and a type scale (depends on T001)
- [ ] T004 [P] Initialize `CHANGELOG.md` at the repo root with a Keep-a-Changelog-style "Unreleased" section (constitution Principle V) (depends on T001)

**Checkpoint**: `npm run dev` and `npm run test` both run cleanly against an empty app.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared calculation-state shape and UI shell every user story builds on.

**CRITICAL**: No user story task may begin until this phase is complete.

- [ ] T005 Define `CalculatorState`, `Operator`, and the `INITIAL_STATE` constant in `src/domain/calculator.types.ts`, matching data-model.md's Calculation State entity (depends on T001)
- [ ] T006 Write failing Vitest tests for digit entry and number normalization — appending a digit, allowing only one decimal point, normalizing leading zeros, and enforcing the 10-digit entry cap (FR-010, FR-017) — in `src/domain/calculator.test.ts` (depends on T005)
- [ ] T007 Implement `inputDigit()` in `src/domain/calculator.ts` to make the T006 tests pass (depends on T006)
- [ ] T008 [P] Build the `CalcButton` primitive: `src/components/CalcButton.tsx` + `CalcButton.css`, consuming `tokens.css` for spacing/focus-ring, with a minimum 44x44px touch target (FR-014, constitution Principle IV) (depends on T003)
- [ ] T009 [P] Build the `Display` component: `src/components/Display.tsx` + `Display.css`, rendering `state.display` including the literal strings `"N/A"` and `"exceeded the max digits"` (depends on T003)
- [ ] T010 Build the `Keypad` component: `src/components/Keypad.tsx` + `Keypad.css` — the full responsive button grid (digits `0`-`9`, `.`, `+`, `-`, `×`, `÷`, `%`, `=`, CE, C, and delete-last-digit), each button wired to a passed-in dispatch callback (no-op stub for now), laid out with no overlap/clipping from 320px up (FR-012) (depends on T008)
- [ ] T011 Build `useCalculator` in `src/hooks/useCalculator.ts` (wraps `INITIAL_STATE` in `useState`, exposes `state` and an `inputDigit` dispatcher calling T007's function) and wire `src/App.tsx` to render `Display` + `Keypad` (depends on T007, T009, T010)

**Checkpoint**: The app runs and shows the full calculator layout responsively; digit buttons update the display; operator/clear/percent buttons are visible but not yet functional.

---

## Phase 3: User Story 1 - Perform a basic calculation (Priority: P1) — MVP

**Goal**: A user can compute the result of one operator applied to two numbers using addition, subtraction, multiplication, or division.

**Independent Test**: Enter a first number, choose an operator, enter a second number, press equals, and confirm the displayed result is correct — including divide-by-zero showing `N/A`.

### Tests for User Story 1 (write first, confirm they fail)

- [ ] T012 [US1] Write failing Vitest tests for `selectOperator()` (add/subtract/multiply/divide, replacing an already-pending operator) and `equals()` (correct results for all four operators, divide-by-zero → `"N/A"`, a result over 10 digits → `"exceeded the max digits"`, equals with no pending operation is a no-op, repeated equals with no new input is idempotent) in `src/domain/calculator.test.ts` (depends on T007)

### Implementation for User Story 1

- [ ] T013 [US1] Implement `selectOperator()` in `src/domain/calculator.ts` to make its T012 tests pass (depends on T012)
- [ ] T014 [US1] Implement `equals()` in `src/domain/calculator.ts` (compute, round/cap per research.md #2-#3, divide-by-zero → `N/A`) to make its T012 tests pass (depends on T012, T013)
- [ ] T015 [US1] Wire the `+`/`-`/`×`/`÷` and `=` buttons in `Keypad.tsx` through `useCalculator.ts`'s dispatcher to `selectOperator()`/`equals()` (depends on T013, T014, T011)
- [ ] T016 [P] [US1] Write an RTL test for click-driven basic calculations (`12+7=19`, `9-15=-6`, `6×7=42`, `20÷4=5`, `5÷0=N/A`) in `src/App.test.tsx` (depends on T015)

**Checkpoint**: MVP complete — full four-operator arithmetic works end-to-end via on-screen buttons.

---

## Phase 4: User Story 2 - Correct a mistake mid-entry (Priority: P2)

**Goal**: A user can delete the last digit, clear only the current entry, or clear the whole calculation.

**Independent Test**: Type digits, then exercise delete-last-digit, clear-entry, and clear-all in isolation, confirming each affects only its claimed scope.

### Tests for User Story 2 (write first, confirm they fail)

- [ ] T017 [US2] Write failing Vitest tests for `clearEntry()`, `clearAll()`, and `backspace()` — including backspace at `"0"` being a no-op and clear-entry preserving the pending operator/first operand — in `src/domain/calculator.test.ts` (depends on T014)

### Implementation for User Story 2

- [ ] T018 [US2] Implement `clearEntry()`, `clearAll()`, and `backspace()` in `src/domain/calculator.ts` to make the T017 tests pass (depends on T017)
- [ ] T019 [US2] Wire the CE / C / delete-last-digit buttons in `Keypad.tsx` through `useCalculator.ts` (depends on T018, T015)
- [ ] T020 [P] [US2] Write an RTL test for clear-entry/clear-all/delete-last-digit flows matching spec.md's User Story 2 acceptance scenarios in `src/App.test.tsx` (depends on T019)

**Checkpoint**: Users can now recover from mistakes without restarting a calculation.

---

## Phase 5: User Story 3 - Calculate a percentage (Priority: P3)

**Goal**: A user can convert the current entry to a percentage, standalone or relative to a pending operation.

**Independent Test**: Enter a number, press percent, and confirm the correct value both standalone and as part of a chained operation (e.g., `200 + 10%`).

### Tests for User Story 3 (write first, confirm they fail)

- [ ] T021 [US3] Write failing Vitest tests for `percent()` — standalone (`value / 100`) and with a pending operator (relative to the first operand, e.g. `200 + 10%` → `20`), per spec.md's Clarifications — in `src/domain/calculator.test.ts` (depends on T014)

### Implementation for User Story 3

- [ ] T022 [US3] Implement `percent()` in `src/domain/calculator.ts` to make the T021 tests pass (depends on T021)
- [ ] T023 [US3] Wire the `%` button in `Keypad.tsx` through `useCalculator.ts` (depends on T022, T015)
- [ ] T024 [P] [US3] Write an RTL test for percentage flows (standalone and chained) matching spec.md's User Story 3 acceptance scenarios in `src/App.test.tsx` (depends on T023)

**Checkpoint**: All everyday-arithmetic operations named in the spec are functional via on-screen buttons.

---

## Phase 6: User Story 4 - Operate entirely from the keyboard (Priority: P4)

**Goal**: Every on-screen action is reachable from the keyboard, with identical results.

**Independent Test**: Perform every action (digits, operators, percent, equals, clear-entry, clear-all, delete-last-digit) using only the keyboard and confirm identical results to the button-driven flows.

### Tests for User Story 4 (write first, confirm they fail)

- [ ] T025 [US4] Write failing Vitest tests for `mapKeyToAction()` covering every binding (`0`-`9`, `.`, `+`, `-`, `*`, `/`, `Enter`, `=`, `Backspace`, `Escape`, `%`) and confirming an unmapped key (e.g., a letter) maps to no action, in `src/domain/keymap.test.ts` (depends on T005)

### Implementation for User Story 4

- [ ] T026 [US4] Implement `mapKeyToAction()` in `src/domain/keymap.ts` to make the T025 tests pass (depends on T025)
- [ ] T027 [US4] Attach a root-level `keydown` listener in `useCalculator.ts` (via `useEffect`) that uses `mapKeyToAction()` to dispatch the same actions the buttons use (depends on T026, T015, T019, T023 — every action it can dispatch must already exist)
- [ ] T028 [P] [US4] Write an RTL test simulating a full keyboard-only flow (type + `Enter`, `Backspace`, `Escape`, `*`/`/` keys, `=` key, an unmapped key doing nothing) matching spec.md's User Story 4 acceptance scenarios in `src/App.test.tsx` (depends on T027)

**Checkpoint**: All four user stories are independently functional; button and keyboard paths produce identical results.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the constitution's quality bars and spec's success criteria are actually met.

- [ ] T029 [P] Add a dated `CHANGELOG.md` entry describing the initial calculator release (constitution Principle V) (depends on T027)
- [ ] T030 Verify and, if needed, adjust the responsive layout at 320px-375px widths per quickstart.md step 6, in `src/components/*.css` (depends on T027)
- [ ] T031 Verify visible keyboard focus indicators and ≥4.5:1 contrast across every button per quickstart.md step 7, adjusting `src/styles/tokens.css` if needed (depends on T027)
- [ ] T032 Run the full quickstart.md manual validation checklist end-to-end and fix any discrepancies found (depends on T029, T030, T031)
- [ ] T033 [P] Confirm `src/domain/` contains no `react`, `react-dom`, or DOM imports (constitution Principle II compliance check) (depends on T027)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — blocks every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational; reuses `equals()`'s state shape from US1 (T014) but is about clearing/deleting, not computing — could be built in parallel with US1 by a second developer once Foundational is done, at the cost of a merge in `Keypad.tsx`/`useCalculator.ts`.
- **User Story 3 (Phase 5)**: Depends on Foundational and on `equals()` existing (T014) so percent-then-equals produces a correct final result.
- **User Story 4 (Phase 6)**: Depends on US1, US2, and US3 all being wired (T015, T019, T023), since keyboard support dispatches the same actions those stories implement — this is the one story that is not independent of the others, by nature of being a parity layer.
- **Polish (Phase 7)**: Depends on US4 (T027) so every interaction path exists before final verification.

### Within Each User Story

- Engine tests are written and confirmed failing before the corresponding engine implementation (constitution Principle III).
- Engine implementation before UI wiring.
- UI wiring before the story's RTL verification test.

### Parallel Opportunities

- T003 and T004 (Setup) can run together.
- T008 and T009 (Foundational) can run together.
- Within Phase 3-6, each story's final RTL test task is marked `[P]` relative to other stories' file work, but note US4 cannot start until US1-3's wiring tasks are done (see above).
- T029 and T033 (Polish) can run together.

---

## Parallel Example: Foundational Phase

```bash
# After T003 (tokens.css) is done, these two can run together:
Task: "Build the CalcButton primitive in src/components/CalcButton.tsx + CalcButton.css"
Task: "Build the Display component in src/components/Display.tsx + Display.css"
```

## Parallel Example: Setup Phase

```bash
# After T001 (scaffold) is done, these two can run together:
Task: "Create src/styles/tokens.css with design tokens"
Task: "Initialize CHANGELOG.md with an Unreleased section"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011) — blocks everything else
3. Complete Phase 3: User Story 1 (T012-T016)
4. **STOP and VALIDATE**: run `npm run test`, then walk through quickstart.md step 1 by hand
5. This is a working, demoable calculator for the four basic operators

### Incremental Delivery

1. Setup + Foundational → a running, empty-but-styled calculator shell
2. + User Story 1 → basic arithmetic (MVP) → validate → demo
3. + User Story 2 → mistake correction → validate → demo
4. + User Story 3 → percentages → validate → demo
5. + User Story 4 → full keyboard parity → validate → demo
6. + Polish → responsive/accessibility/CHANGELOG verification → ship

Each step adds value without breaking the previous one, since every story after Foundational only adds new engine functions and wires new buttons — it never changes the signature of an already-shipped function.
