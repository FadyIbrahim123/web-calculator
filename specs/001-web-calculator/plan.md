# Implementation Plan: Web Calculator

**Branch**: `001-web-calculator` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-web-calculator/spec.md`

## Summary

A client-side calculator SPA supporting addition, subtraction, multiplication, division, and percentage, plus clear-entry, clear-all, and delete-last-digit, operable by mouse/touch and keyboard, that never crashes or shows raw error values, and stays usable from a 320px phone up through desktop. Built as a Vite + React + TypeScript (strict) app with a framework-free calculation engine isolated in `src/domain/`, styled with plain CSS design tokens (no CSS/UI/state-management framework), and unit-tested with Vitest. No backend, no database — all state is ephemeral, held in memory for the life of the page.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 18, ES2020+ target

**Primary Dependencies**: React 18 + ReactDOM (UI rendering only — no state-management library per constitution), Vite (dev server/bundler), Vitest + React Testing Library (testing)

**Storage**: N/A — no persistence of any kind; calculation state is ephemeral, held only in memory for the current page session (spec Assumptions: no history/memory functions, no persistence across reloads)

**Testing**: Vitest for domain-engine unit tests; Vitest + React Testing Library for component/keyboard-interaction tests

**Target Platform**: Modern evergreen browsers (desktop and mobile), static client-side site — no server runtime required at request time

**Project Type**: Single-page web frontend (no backend)

**Performance Goals**: Interaction-to-display-update feels instant (well under 100ms) — a standard client-side SPA expectation, not a throughput-bound system

**Constraints**: Usable with no horizontal scrolling/overlap from 320px width up (spec FR-012, SC-005); full keyboard operability (spec FR-007); visible focus indicators and ≥4.5:1 contrast (constitution Principle IV); no `eval()` or expression-parser packages (constitution Additional Constraints)

**Scale/Scope**: Single page, single user, handful of UI states (idle, entering, pending-operator, error) — no concurrency or multi-user concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All five constitution principles apply to this feature (there is no principle that's out of scope for a project this size):

| # | Principle | Applies | How this plan complies |
|---|-----------|---------|-------------------------|
| I | Simplicity & YAGNI | Yes | Dependency list is exactly what the user specified (React, Vite, Vitest) — no state-management, UI-component, or CSS framework added. Single domain module, no repository/service-layer indirection, no speculative abstractions for features not in the spec (no memory functions, no history). |
| II | Pure Logic Core | Yes | All arithmetic, percentage, and input-normalization logic lives in `src/domain/`, written in plain TypeScript with zero React/DOM imports. UI components call into it but never re-implement calculation logic. |
| III | Test-First Development | Yes | `/speckit-tasks` will order domain-engine unit tests before the corresponding implementation, per spec acceptance scenarios and edge cases (e.g., a failing "divide by zero → N/A" test precedes the code that makes it pass). |
| IV | Accessibility & Responsiveness by Default | Yes | Native `<button>` elements throughout (built-in keyboard focusability), visible focus outlines in `styles/tokens.css`, ≥4.5:1 contrast tokens, layout validated at 320–375px per spec FR-012/FR-014/SC-005. |
| V | Change Tracking | Yes | Implementation tasks include a `CHANGELOG.md` entry for the initial calculator release; future behavior changes to this feature must add their own dated entry. |

**Additional Constraints check**:

| Constraint | Status | Notes |
|---|---|---|
| No `eval()` / expression-parser packages | PASS | The engine only ever combines two operands with one pending operator at a time (per spec FR-002/FR-003/edge cases) — no expression string is ever parsed or evaluated. |
| No state-management library | PASS | UI state is plain React state (`useState`/`useReducer`) inside one `useCalculator` hook; domain state is a plain object. |
| No component library | PASS | All components (`Display`, `Keypad`, `CalcButton`) are hand-written. |
| No CSS framework | PASS | Plain CSS with a hand-authored design-token file (`styles/tokens.css`); no Tailwind/Bootstrap/etc. |
| No backend | PASS | Static SPA; no server code, no API routes. |

**Result**: PASS — no violations, Complexity Tracking table is not needed.

**Post-design re-check** (after Phase 1 research/data-model/quickstart below): Still PASS. `research.md` and `data-model.md` introduced no new dependency, no expression parser, no state-management/UI/CSS framework, and kept all calculation logic inside `src/domain/` — the gates above are unaffected by the detailed design.

## Project Structure

### Documentation (this feature)

```text
specs/001-web-calculator/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output — records the concrete engineering decisions within the given stack
├── data-model.md        # Phase 1 output — the Calculation State shape from spec's Key Entities section
├── quickstart.md        # Phase 1 output — run/validate the feature end-to-end
├── contracts/           # N/A — see note below; folder intentionally not created
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

**`contracts/` — N/A**: This feature exposes no network API, CLI surface, or any interface consumed by another system or service — it's a single-page, backend-free calculator. The only "interface" is the exported TypeScript function signatures of `src/domain/`, which are already fully specified (with types) in `data-model.md`. Manufacturing request/response contract documents for an internal module with no external consumer would be pure ceremony and a direct violation of Principle I (Simplicity & YAGNI), so this folder is deliberately not created.

### Source Code (repository root)

```text
src/
├── domain/                    # Pure calculation engine — no React/DOM imports (Principle II)
│   ├── calculator.ts          # state-transition functions: digit entry, operator, percent, clear-entry,
│   │                          # clear-all, backspace, equals
│   ├── calculator.types.ts    # CalculatorState, Operator, and related types
│   └── calculator.test.ts     # Vitest unit tests, written before the implementation (Principle III)
├── components/
│   ├── Display.tsx            # renders current value / N/A / "exceeded the max digits"
│   ├── Keypad.tsx             # renders on-screen buttons, wires clicks to the hook
│   ├── CalcButton.tsx         # single button primitive (shared sizing/spacing/focus styles)
│   └── *.test.tsx             # React Testing Library tests for click + keyboard interaction
├── hooks/
│   └── useCalculator.ts       # bridges src/domain state machine to React state + keyboard event listener
├── styles/
│   ├── tokens.css             # design tokens: color, spacing, radius, type scale, focus ring
│   └── *.css                  # component styles consuming the tokens
├── App.tsx
└── main.tsx

# + standard Vite scaffolding: index.html, vite.config.ts, tsconfig.json (strict), package.json
```

**Structure Decision**: Single frontend project (no `backend/`/`api/` — none exists). Tests are co-located next to the source they cover (`*.test.ts(x)` beside each module) rather than mirrored into a separate `tests/` tree: for a project this size, a parallel directory structure is exactly the kind of indirection Principle I (Simplicity & YAGNI) argues against, and Vitest supports co-located tests natively. The one structural rule that matters is kept: `src/domain/` contains no import of `react`, `react-dom`, or any DOM API, enforced by code review against Principle II.
