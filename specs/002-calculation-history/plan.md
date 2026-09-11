# Implementation Plan: Calculation History

**Branch**: `002-calculation-history` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-calculation-history/spec.md`

## Summary

Add a short (5-entry), session-only history of completed calculations, viewable and reusable from a hidden-by-default overlay/drawer, plus a one-action clear. The primary technical constraint is architectural, not algorithmic: the feature must be layered **on top of** round 1's pure calculation engine (`src/domain/calculator.ts` + `calculator.types.ts`) without modifying it — history is captured by observing completed `equals` transitions from the outside, not by teaching the engine about history. This is implemented as one new pure domain module (`src/domain/history.ts`), one new UI-orchestration hook (`useHistory`), one small additive (optional-parameter) change to the existing `useCalculator` hook so both mouse and keyboard equals paths report completions through a single code path, and new presentational components for the overlay/drawer. No new dependency, no state-management library, no persistence layer.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 18, ES2020+ target — unchanged from round 1

**Primary Dependencies**: React 18 + ReactDOM (unchanged); no new runtime dependency added for this feature (list rendering, overlay toggling, and id generation are all handled with plain React state/props and built-in browser APIs)

**Storage**: N/A for persistence — per spec FR-009/Clarifications, history is held only in the page's in-memory React state for the current session and is never written to `localStorage`/`sessionStorage`/cookies/a backend. Unlike round 1's single ephemeral `CalculatorState`, this feature does introduce a real (if short-lived) **in-memory** collection — the History List — which is why `data-model.md` is substantive for this feature rather than the near-empty shell round 1's was.

**Testing**: Vitest for the new `src/domain/history.ts` unit tests (test-first per Principle III); Vitest + React Testing Library for the new `HistoryPanel`/toggle component tests and for the small `useCalculator` addition — unchanged from round 1's approach

**Target Platform**: Modern evergreen browsers (desktop and mobile) — unchanged

**Project Type**: Single-page web frontend (no backend) — unchanged

**Performance Goals**: History updates and panel open/close feel instant (well under 100ms), consistent with round 1's interaction-to-display-update goal; a 5-entry list has no meaningful rendering cost

**Constraints**: The history overlay/drawer MUST NOT resize, reflow, or reposition the existing keypad at any supported width down to 320-375px (spec FR-008, Edge Cases); the calculation engine (`src/domain/calculator.ts`, `calculator.types.ts`, `keymap.ts`) MUST remain byte-for-byte unmodified by this feature (spec FR-011, constitution Principle II); no `eval()`/expression-parser packages (constitution, unaffected — history never parses or re-executes an expression string)

**Scale/Scope**: Single page, single user, one bounded 5-item list — no concurrency, no multi-user, no cross-tab/device sync (spec Assumptions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This is the gate the user asked to have "real teeth": it must demonstrate the history feature **extends** the existing engine rather than **forking or rewriting** it. The test applied below is concrete and falsifiable: list every file the engine consists of, and show each is either untouched or changed only in a narrowly-scoped, additive way.

| # | Principle | Applies | How this plan complies |
|---|-----------|---------|-------------------------|
| I | Simplicity & YAGNI | Yes | No new dependency (list rendering and id generation use plain React/browser primitives). One new domain module (`history.ts`), one new hook, a handful of presentational components — no repository/service-layer indirection, no generalized "history of anything" abstraction, no persistence layer the spec didn't ask for (FR-009 explicitly rules it out). |
| II | Pure Logic Core | Yes, and this is the crux of this feature | `src/domain/calculator.ts` and `src/domain/calculator.types.ts` (the engine) are **not modified at all** — see the file-by-file table below. The new `src/domain/history.ts` module is itself also framework-free (no React/DOM import), pure, and independently unit-testable, matching the same discipline the engine already follows — it is a sibling pure module, not a hole punched into the engine. |
| III | Test-First Development | Yes | `history.ts`'s functions (`recordEntry` eviction-at-5 behavior, `clearHistory`, `restoreState`) get failing Vitest unit tests before implementation, exactly as round 1 did for `calculator.ts`. |
| IV | Accessibility & Responsiveness by Default | Yes | The history toggle is a native `<button>` (keyboard-focusable, visible focus ring from the existing `tokens.css`); the overlay/drawer is validated at 320–375px per FR-008/Edge Cases, reusing round 1's established contrast/focus tokens rather than introducing new ones. |
| V | Change Tracking | Yes | Implementation tasks include a dated `CHANGELOG.md` entry for calculation history, per constitution Principle V. |

**File-by-file engine-boundary check** (the concrete evidence for Principle II / spec FR-011):

| File | Status | Why |
|---|---|---|
| `src/domain/calculator.ts` | **Unchanged** | All arithmetic/state-transition logic (`inputDigit`, `equals`, `selectOperator`, `percent`, `clearEntry`, `clearAll`, `backspace`) stays exactly as round 1 shipped it. |
| `src/domain/calculator.types.ts` | **Unchanged** | `CalculatorState` gains no history-related field; the engine's state shape has no notion that history exists. |
| `src/domain/keymap.ts` | **Unchanged** | No new keyboard bindings are introduced (spec does not require any — see research.md #7); existing bindings are untouched. |
| `src/domain/history.ts` (+ `.types.ts`, `.test.ts`) | **New, additive** | Sibling pure module. Consumes `CalculatorState`/`Operator` types by reading them, never by altering them. |
| `src/hooks/useCalculator.ts` | **Modified, narrowly** | Gains one optional constructor parameter, `onEqualsComplete`, invoked from the two existing call sites that already call the engine's `equals()` (the `onEquals` handler and the keydown `"equals"` case) — see research.md #1. No existing exported behavior, return shape, or default-call semantics changes; round 1's existing tests continue to pass unmodified. |
| `src/hooks/useHistory.ts` | **New, additive** | Owns the History List state and calls into `history.ts`; the engine hook does not know this hook exists. |
| `src/App.tsx`, new components | **Modified/new, composition only** | Wires the new hook/components alongside the existing, unchanged `useCalculator`/`Keypad`/`Display`. |

**Additional Constraints check**:

| Constraint | Status | Notes |
|---|---|---|
| No `eval()` / expression-parser packages | PASS | History stores/replays a structured `{firstOperand, operator, secondOperand, result}` shape it already has from observing the engine — it never parses a string. |
| No state-management library | PASS | History state is plain React state (`useState`) inside one `useHistory` hook, same pattern as `useCalculator`. |
| No component library | PASS | New `HistoryPanel`/`HistoryEntryRow`/toggle components are hand-written, reusing existing `CalcButton`/token patterns. |
| No CSS framework | PASS | Overlay/drawer positioning done with plain CSS (fixed/absolute positioning + a toggled class), consuming existing `styles/tokens.css` — no new framework. |
| No backend | PASS | Still a static SPA; history never leaves the browser tab. |

**Result**: PASS — no violations, Complexity Tracking table is not needed.

**Post-design re-check** (after Phase 1 research/data-model/quickstart below): Still PASS. `data-model.md` adds one new in-memory entity (History List) that is explicitly scoped to the UI/orchestration layer, not the engine; `research.md`'s capture-point decision (#1) is the one design choice with the most leverage over this gate, and it was resolved specifically to keep the engine untouched rather than the more "obvious" alternative of adding an expression field to `CalculatorState`.

## Project Structure

### Documentation (this feature)

```text
specs/002-calculation-history/
├── plan.md              # This file (/speckit-plan command output)
├── research.md           # Phase 0 output — capture point, eviction/reuse mechanics, layout approach
├── data-model.md          # Phase 1 output — History Entry / History List (see note above: not N/A this time)
├── quickstart.md          # Phase 1 output — run/validate the feature end-to-end
├── contracts/              # N/A — see note below; folder intentionally not created
└── tasks.md                # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

**`contracts/` — N/A**: Same rationale as round 1: this feature exposes no network API, CLI surface, or interface consumed by another system — it's still a single-page, backend-free calculator. The only "interfaces" are TypeScript function signatures internal to this repo (`src/domain/history.ts`, the `useCalculator`/`useHistory` hooks), which `data-model.md` already fully specifies with types. A contracts folder for an internal-only module would be ceremony, violating Principle I.

### Source Code (repository root)

```text
src/
├── domain/                        # Pure engine — Principle II (unchanged files marked)
│   ├── calculator.ts               # UNCHANGED (round 1)
│   ├── calculator.types.ts          # UNCHANGED (round 1)
│   ├── calculator.test.ts           # UNCHANGED (round 1)
│   ├── keymap.ts                    # UNCHANGED (round 1)
│   ├── keymap.test.ts               # UNCHANGED (round 1)
│   ├── history.types.ts             # NEW — HistoryEntry type, MAX_HISTORY_ENTRIES = 5
│   ├── history.ts                   # NEW — recordEntry (add + evict), clearHistory, restoreState — all pure
│   └── history.test.ts              # NEW — Vitest unit tests, written before history.ts (Principle III)
├── components/
│   ├── Display.tsx, Keypad.tsx, CalcButton.tsx   # UNCHANGED (round 1)
│   ├── HistoryToggle.tsx             # NEW — button that opens/closes the overlay; native <button>, visible focus ring
│   ├── HistoryPanel.tsx              # NEW — the overlay/drawer: list of entries (most-recent-first), empty state, Clear action
│   ├── HistoryPanel.css              # NEW — fixed/absolute overlay positioning; never participates in Keypad's layout flow
│   └── *.test.tsx                    # NEW — RTL tests for view/reuse/clear/empty-state, alongside existing component tests
├── hooks/
│   ├── useCalculator.ts              # MODIFIED (narrow, additive) — optional onEqualsComplete callback; see Constitution Check table
│   └── useHistory.ts                 # NEW — owns HistoryEntry[] state; addFromCalculation, reuse, clear
├── styles/tokens.css                 # UNCHANGED — new components consume existing tokens, add no new ones
├── App.tsx                           # MODIFIED — composes useHistory + HistoryToggle + HistoryPanel alongside the unchanged calculator wiring
└── main.tsx                          # UNCHANGED

# No new top-level directories; same co-located-tests convention as round 1 (Principle I)
```

**Structure Decision**: Same single-frontend-project structure as round 1, tests co-located with source. The only structural rule added by this feature: everything that needs to know an expression was just completed lives in `src/hooks/`, never in `src/domain/calculator*.ts` — enforced the same way round 1 enforces "no React/DOM import in `src/domain/`", by code review against Principle II, now with the added, explicit check that `calculator.ts`/`calculator.types.ts`/`keymap.ts` have zero diff against round 1.

## Complexity Tracking

*No violations — table intentionally omitted (Constitution Check is a full PASS).*
