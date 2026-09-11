# Tasks: Calculation History

**Input**: Design documents from `/specs/002-calculation-history/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Tests**: Included and required — the constitution's Test-First Development principle applies to the new `src/domain/history.ts` module exactly as it did to round 1's `src/domain/calculator.ts`.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

**Blast radius**: Round 1 (`001-web-calculator`) already shipped and is in production use of a sort — every task below states plainly whether it creates a new file or modifies an existing one, and every modification to an existing file is called out explicitly so the risk to already-shipped behavior is visible before work starts. `src/domain/calculator.ts`, `src/domain/calculator.types.ts`, and `src/domain/keymap.ts` are modified by **zero** tasks in this file — that is the concrete, checkable form of plan.md's Constitution Check (Principle II).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1-US3); Setup, Foundational, and Polish tasks carry no story label
- Every task states **New file(s):** or **Modifies:** with exact path(s)

## Path Conventions

Single frontend project per plan.md's Structure Decision — `src/` at the repository root, tests co-located next to the source they cover (`*.test.ts(x)`), no separate `tests/` tree. Same convention round 1 already established.

---

## Phase 1: Setup

**Purpose**: Establish the pre-change baseline so every later modification's blast radius is measured against a known-good state.

- [ ] T001 Run `npm run dev` and `npm run test` on branch `002-calculation-history` before making any change, and confirm round 1's full suite (`src/domain/calculator.test.ts`, `src/domain/keymap.test.ts`, `src/App.test.tsx`) passes as-is. **No files modified** — this is the baseline every "Modifies:" task below is measured against.

**Checkpoint**: Baseline confirmed green. No new dependency or config is needed for this feature (plan.md Technical Context) — Setup ends here.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared History Entry shape and a visible-but-inert history UI shell every user story builds on — mirrors how round 1's Foundational phase built `CalculatorState` + an unwired `Keypad` before any story made the buttons do something.

**CRITICAL**: No user story task may begin until this phase is complete.

- [ ] T002 Define `HistoryEntry` (`{ id: string; firstOperand: number; operator: Operator; secondOperand: number; result: string }`) and `MAX_HISTORY_ENTRIES = 5` in **New file:** `src/domain/history.types.ts`, matching data-model.md's History Entry entity (imports `Operator` from `./calculator.types` — read-only, does not modify that file) (depends on T001)
- [ ] T003 [P] Build the `HistoryToggle` component — a native `<button>` with `aria-expanded={isOpen}` and an accessible name that reflects state (e.g. "Show history" / "Hide history"), taking `isOpen: boolean` and `onToggle: () => void` props, styled from existing `styles/tokens.css` values only — **New files:** `src/components/HistoryToggle.tsx`, `src/components/HistoryToggle.css` (depends on T001)
- [ ] T004 [P] Build the `HistoryPanel` shell — takes `entries: HistoryEntry[]`, `isOpen: boolean`, `onSelect: (entry: HistoryEntry) => void`, `onClear: () => void` props; conditionally rendered only when `isOpen` (so it is never in the accessibility tree or the keypad's layout flow when closed) as a `position: fixed` overlay that never participates in the keypad's flex/grid layout (research.md #5); renders an empty-state message (e.g. "No calculations yet.") when `entries` is empty, and a "Clear history" button wired to `onClear`; entry rendering itself is stubbed for now (real rows land in T012) — **New files:** `src/components/HistoryPanel.tsx`, `src/components/HistoryPanel.css`. Also **Modifies:** `src/components/Keypad.tsx` — add `export` to the existing `OPERATOR_LABELS` map so `HistoryPanel` can reuse the same `+ − × ÷` symbols instead of duplicating them (depends on T002)
- [ ] T005 [P] Build the `useHistory` hook — `useState<HistoryEntry[]>([])` for `entries`, `useState(false)` for `isOpen`, exposes `{ entries, isOpen, toggle }` for now (`addFromCalculation`/`reuse`/`clear` are added by their respective stories below, T010/T017/T023) — **New file:** `src/hooks/useHistory.ts` (depends on T002)
- [ ] T006 Wire `App.tsx` to render `HistoryToggle` and `HistoryPanel` using `useHistory()`'s `entries` (always `[]` for now), `isOpen`, and `toggle`, alongside the existing, still-untouched `useCalculator()` wiring — **Modifies:** `src/App.tsx` (depends on T003, T004, T005)

**Checkpoint**: The app shows a history toggle and an (always-empty) panel that never disturbs the keypad's layout. Round 1's own behavior (verified in T001) is unaffected — `useCalculator.ts` has not been touched yet.

---

## Phase 3: User Story 1 - Review recent calculations (Priority: P1) — MVP

**Goal**: After completing calculations, the user can open the history view and see each one (expression + result), most-recent-first, capped at 5, with failed calculations excluded.

**Independent Test**: Complete several calculations (including one divide-by-zero), open the history view, and confirm the list is correct, ordered, capped, and excludes the error.

### Tests for User Story 1 (write first, confirm they fail)

- [ ] T007 [US1] Write failing Vitest tests for `recordEntry()` — prepends a new entry (most-recent-first), and once 5 entries are present, adding a 6th drops the oldest (FR-004, data-model.md) — **Modifies:** `src/domain/history.test.ts` (**New file** — first content added here) (depends on T002)

### Implementation for User Story 1

- [ ] T008 [US1] Implement `recordEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[]` as `[entry, ...history].slice(0, MAX_HISTORY_ENTRIES)` to satisfy T007 — **New file:** `src/domain/history.ts` (depends on T007)
- [ ] T009 [P] [US1] Add an optional `onEqualsComplete?: (entry: { firstOperand: number; operator: Operator; secondOperand: number; result: CalculatorState }) => void` parameter to `useCalculator`. In both the `onEquals` handler and the keydown `"equals"` case, before calling the engine's `equals()`, capture `{ firstOperand: state.previousOperand, operator: state.operator, secondOperand: Number(state.display) }`; after `equals()` returns, if the pre-call state had `!state.isError && state.operator !== null && state.previousOperand !== null` (a genuine pending calculation, not a no-op equals) **and** the result has `!result.isError`, call `onEqualsComplete({ ...captured, result })`. `calculator.ts`/`calculator.types.ts` are not touched by this task. — **Modifies:** `src/hooks/useCalculator.ts` (depends on T001; independent of T007/T008 — different file)
- [ ] T010 [US1] Extend `useHistory` with `addFromCalculation(entry)`: generate an `id` from a `useRef` incrementing counter, build a `HistoryEntry`, and call `recordEntry()` (T008) to update `entries` state — **Modifies:** `src/hooks/useHistory.ts` (depends on T008, T005)
- [ ] T011 [US1] Wire `App.tsx`: pass `useHistory().addFromCalculation` as `useCalculator`'s new `onEqualsComplete`, and pass live `entries` (instead of the always-`[]` placeholder from T006) into `HistoryPanel` — **Modifies:** `src/App.tsx` (depends on T009, T010)
- [ ] T012 [P] [US1] Render real entry rows in `HistoryPanel`: each entry as `{firstOperand} {OPERATOR_LABELS[operator]} {secondOperand} = {result}` (using the export added in T004), most-recent-first per the array order `entries` already has — **Modifies:** `src/components/HistoryPanel.tsx` (depends on T002, T004; independent of T009/T010/T011 — different file)
- [ ] T013 [US1] Write RTL tests for History User Story 1 in a new `describe("App — history: review recent calculations (History US1)")` block: empty state on fresh load; an entry appears after `12 + 7 =`; a second calculation (`6 × 7 =`) appears above the first; after 6 calculations only the 5 most recent show and the 1st is gone; a `5 ÷ 0 =` (`N/A`) calculation never appears — **Modifies:** `src/App.test.tsx` (existing describe blocks from round 1 are untouched) (depends on T011, T012)

**Checkpoint**: User Story 1 is fully functional and independently testable — history can be viewed end-to-end.

---

## Phase 4: User Story 2 - Reuse a past calculation (Priority: P2)

**Goal**: Selecting a history entry recalls its full expression and replaces the active calculation with its result.

**Independent Test**: Complete a calculation, select its history entry, and confirm the display becomes that entry's result — including when a different calculation was in progress.

### Tests for User Story 2 (write first, confirm they fail)

- [ ] T014 [US2] Write a failing Vitest test for `restoreState(entry)` returning `{ display: entry.result, previousOperand: null, operator: null, awaitingSecondOperand: false, isError: false }` — **Modifies:** `src/domain/history.test.ts` (depends on T008)

### Implementation for User Story 2

- [ ] T015 [US2] Implement `restoreState()` to satisfy T014 — **Modifies:** `src/domain/history.ts` (depends on T014)
- [ ] T016 [P] [US2] Add an `onRestore: (state: CalculatorState) => void` handler to `useCalculator`, calling `setState(state)` directly — this loads an already-valid `CalculatorState` the engine itself produced the shape for (research.md #4); no engine transition function is added or changed — **Modifies:** `src/hooks/useCalculator.ts` (depends on T009; independent of T014/T015 — different file)
- [ ] T017 [US2] Extend `useHistory` with `reuse(entry): CalculatorState`, a pure passthrough to `restoreState(entry)` — does not mutate `entries` — **Modifies:** `src/hooks/useHistory.ts` (depends on T015, T010)
- [ ] T018 [US2] Wire `App.tsx`: selecting an entry calls `calculator.onRestore(history.reuse(entry))` — **Modifies:** `src/App.tsx` (depends on T016, T017)
- [ ] T019 [P] [US2] Make each entry row in `HistoryPanel` a focusable, clickable `<button>` (visible focus ring from existing tokens) firing the existing `onSelect(entry)` prop — **Modifies:** `src/components/HistoryPanel.tsx` (depends on T012; independent of T014-T018 — different file)
- [ ] T020 [US2] Write RTL tests for History User Story 2 in a new `describe("App — history: reuse a past calculation (History US2)")` block: selecting `12 + 7 = 19` sets the display to `19`; selecting it while `45 +` is in progress discards the in-progress entry instead of appending to it; continuing after reuse (`+`, `3`, `=` → `22`) computes correctly and the new result itself appears in history; selecting an entry never removes or reorders the history list — **Modifies:** `src/App.test.tsx` (depends on T018, T019)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Clear the history list (Priority: P3)

**Goal**: The user can clear all history entries in one action without affecting the active calculation.

**Independent Test**: Populate history, clear it, confirm the empty state, and confirm the active calculation is untouched.

### Tests for User Story 3 (write first, confirm they fail)

- [ ] T021 [US3] Write a failing Vitest test for `clearHistory()` returning `[]` unconditionally — **Modifies:** `src/domain/history.test.ts` (depends on T015)

### Implementation for User Story 3

- [ ] T022 [US3] Implement `clearHistory()` to satisfy T021 — **Modifies:** `src/domain/history.ts` (depends on T021)
- [ ] T023 [US3] Extend `useHistory` with `clear()`, setting `entries` to `clearHistory()`'s result — **Modifies:** `src/hooks/useHistory.ts` (depends on T022, T017)
- [ ] T024 [P] [US3] Confirm the "Clear history" button built in T004 is wired to the `onClear` prop (it already is, from T004) and remains a no-op-safe action on an already-empty list (`clearHistory()` is already idempotent — `[] → []`) — **Modifies:** `src/components/HistoryPanel.tsx` only if any adjustment is needed; otherwise this task is a verification pass with no diff (depends on T004; independent of T021-T023 — different file)
- [ ] T025 [US3] Wire `App.tsx`: `HistoryPanel`'s `onClear` calls `history.clear()`; confirm by inspection that no code path connects this to `calculator`'s state, so clearing history can never affect the active display/pending operator (FR-006) — **Modifies:** `src/App.tsx` (depends on T023, T024)
- [ ] T026 [US3] Write RTL tests for History User Story 3 in a new `describe("App — history: clear the list (History US3)")` block: clearing populated history shows the empty state; a calculation completed right after appears as the sole entry; clearing an already-empty list is a no-op; clearing history while `45 +` is typed but not yet computed leaves the active display (`45`) untouched — **Modifies:** `src/App.test.tsx` (depends on T025)

**Checkpoint**: All three history user stories are independently functional; combined with round 1, the calculator now supports view/reuse/clear of a 5-entry session history.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the constitution's quality bars, the engine-purity guarantee, and spec.md's success criteria are actually met.

- [ ] T027 [P] Add a dated `CHANGELOG.md` entry for calculation history (view/reuse/clear, 5-entry cap, session-only) — **Modifies:** `CHANGELOG.md` (constitution Principle V) (depends on T026)
- [ ] T028 Verify the history overlay/drawer never resizes, reflows, or repositions the keypad at 320-375px, per quickstart.md step 5 — **Modifies:** `src/components/HistoryPanel.css` and/or `src/components/HistoryToggle.css` only if adjustments are found necessary (FR-008) (depends on T026)
- [ ] T029 Verify the history toggle and entry-row buttons show visible keyboard focus indicators and meet ≥4.5:1 contrast, using only existing `styles/tokens.css` values (no new tokens introduced) — **Modifies:** `src/components/HistoryToggle.css` / `src/components/HistoryPanel.css` only if adjustments are found necessary (constitution Principle IV) (depends on T026)
- [ ] T030 [P] Confirm `src/domain/calculator.ts`, `src/domain/calculator.types.ts`, and `src/domain/keymap.ts` are byte-for-byte identical to round 1 (e.g. `git diff 001-web-calculator -- src/domain/calculator.ts src/domain/calculator.types.ts src/domain/keymap.ts` shows no output) — the concrete, checkable form of plan.md's Constitution Check. **No files modified** by this task — it is a verification gate; if it fails, the correct fix is to move the offending logic into `history.ts`/`useCalculator.ts`'s additive callback, not to accept the diff (depends on T026)
- [ ] T031 [P] Confirm `src/domain/history.ts` and `src/domain/history.types.ts` contain no `react`, `react-dom`, or DOM imports (Principle II applied to the new pure module too). **No files modified** by this task — verification only (depends on T026)
- [ ] T032 Run the full quickstart.md manual validation checklist end-to-end — including step 1's round-1-regression pass — and fix any discrepancies found (depends on T027, T028, T029, T030, T031)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — blocks every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational; its `useCalculator.ts` edit (T016) is sequenced after US1's `useCalculator.ts` edit (T009) since both touch the same file, but US2 does not depend on US1's history-capture logic being exercised — reuse works on any entry already in `entries`, however it got there.
- **User Story 3 (Phase 5)**: Depends on Foundational; its `useHistory.ts` edit (T023) is sequenced after US2's (T017) for the same same-file reason, with no functional dependency on reuse.
- **Polish (Phase 6)**: Depends on all three stories (T026) so every interaction path exists before final verification.

### Within Each User Story

- Domain tests (`history.test.ts`) are written and confirmed failing before the corresponding `history.ts` implementation (constitution Principle III).
- Domain implementation before hook wiring (`useHistory.ts`/`useCalculator.ts`).
- Hook wiring before `App.tsx` composition.
- `App.tsx` composition before the story's RTL verification test.

### Parallel Opportunities

- T003, T004, T005 (Foundational) can run together once T002 is done (three different files).
- T009 and T012 (US1) touch different files (`useCalculator.ts`, `HistoryPanel.tsx`) than the T007/T008 domain-test-then-impl pair and than each other — all four can proceed in parallel once their individual dependencies (T001/T002/T007/T004) are met.
- T016 and T019 (US2) similarly touch different files than T014/T015 and than each other.
- T024 (US3) touches a different file than T021/T022/T023.
- T027, T030, and T031 (Polish) can run together.

---

## Parallel Example: Foundational Phase

```bash
# After T002 (history.types.ts) is done, these three can run together:
Task: "Build HistoryToggle in src/components/HistoryToggle.tsx + HistoryToggle.css"
Task: "Build the HistoryPanel shell in src/components/HistoryPanel.tsx + HistoryPanel.css (also exports OPERATOR_LABELS from Keypad.tsx)"
Task: "Build the useHistory hook skeleton in src/hooks/useHistory.ts"
```

## Parallel Example: User Story 1

```bash
# After T001/T002/T004/T007 are each satisfied, these can run together:
Task: "Add onEqualsComplete to useCalculator in src/hooks/useCalculator.ts"
Task: "Render real entry rows in src/components/HistoryPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T006) — blocks everything else
3. Complete Phase 3: User Story 1 (T007-T013)
4. **STOP and VALIDATE**: run `npm run test`, then walk through quickstart.md steps 1-2 by hand, and confirm T030's engine-diff check passes
5. This is a working, demoable "view your recent calculations" feature, with round 1 provably untouched

### Incremental Delivery

1. Setup + Foundational → history toggle/panel visible but always empty; round 1 behavior unaffected
2. + User Story 1 → view history (MVP) → validate → demo
3. + User Story 2 → reuse a past calculation → validate → demo
4. + User Story 3 → clear history → validate → demo
5. + Polish → layout/accessibility/CHANGELOG/engine-purity verification → ship

Each step adds value without breaking the previous one or round 1: every story after Foundational only adds new `history.ts` functions and small, additive `useCalculator.ts`/`useHistory.ts`/`HistoryPanel.tsx` wiring — it never changes an already-shipped function's signature, and `calculator.ts`/`calculator.types.ts`/`keymap.ts` are never touched at all (verified explicitly by T030).
