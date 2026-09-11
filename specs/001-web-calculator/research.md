# Research: Web Calculator

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

The technology stack (Vite + React + TypeScript strict, Vitest, plain CSS, no backend/database) was specified directly by the requester, so there are no open "which framework" questions here. What remains is a handful of concrete engineering decisions needed to satisfy the spec's edge cases and the constitution's Pure Logic Core / Simplicity principles. Each is recorded below.

## 1. Calculation state machine shape

- **Decision**: Represent calculator state as one plain object: `{ display: string, previousOperand: number | null, operator: Operator | null, awaitingSecondOperand: boolean, isError: boolean }`. Every user action (digit, operator, percent, equals, clear-entry, clear-all, backspace) is a pure function `(state, action) → state` in `src/domain/calculator.ts`.
- **Rationale**: Matches the spec's Key Entities section (Calculation State: displayed value, first operand, operator, error/status indicator) exactly, with nothing extra added. A pure reducer-shaped function is trivial to unit test in isolation (Principle III) and has zero framework dependency (Principle II).
- **Alternatives considered**: A class-based calculator engine with mutable internal state — rejected as an unnecessary abstraction for five state fields (Principle I, YAGNI). A full expression-string parser/evaluator — rejected outright; the constitution explicitly forbids `eval()`/expression-parser packages, and the spec only ever needs one pending operator at a time.

## 2. Floating-point precision & rounding

- **Decision**: Round every computed result to at most 10 significant digits before display, using a fixed rounding step (`Number(result.toPrecision(10))`-equivalent logic) inside the domain engine, not in the UI layer.
- **Rationale**: JavaScript floating-point arithmetic produces artifacts like `0.1 + 0.2 = 0.30000000000000004`. Spec FR-017 already caps displayed digits at 10, so rounding to that same limit both fixes float artifacts and enforces the digit cap in one place, keeping the UI a pure renderer of whatever string the domain engine hands it.
- **Alternatives considered**: A big-decimal/arbitrary-precision library — rejected as a dependency the spec's "everyday arithmetic" scope doesn't justify (Principle I). Rounding in the display component instead of the domain engine — rejected because it would leak calculation behavior out of `src/domain/`, violating Principle II.

## 3. Digit-cap enforcement point (FR-017)

- **Decision**: Enforce the 10-digit cap in two places inside the domain engine: (a) digit-entry actions are rejected once the current entry's digit count (excluding sign/decimal point) reaches 10, and (b) any computed result whose digit count would exceed 10 replaces the display value with the literal string `"exceeded the max digits"` and sets `isError: true`.
- **Rationale**: Keeps both halves of FR-017 (entry cap and result cap) as domain-engine responsibilities the UI just renders, consistent with Principle II.
- **Alternatives considered**: Enforcing the entry cap via an `maxlength`-style UI-level check — rejected because keyboard input bypasses HTML input constraints in a button-driven (non-`<input>`) calculator UI, and it would split validation logic across two layers.

## 4. Percentage semantics (spec Clarifications)

- **Decision**: `percent(state)` returns `value / 100` when no operator is pending, or `(previousOperand * value) / 100` when an operator is pending — matching the spec's clarified behavior (`200 + 10%` adds `20`).
- **Rationale**: Directly implements the answer recorded in spec.md's Clarifications section; isolating it as one small pure function makes it independently unit-testable per Principle III.
- **Alternatives considered**: None — this was a resolved clarification, not an open design choice.

## 5. Keyboard input handling

- **Decision**: A single `keydown` listener attached at the app root (via `useEffect` in `useCalculator.ts`) maps `0`-`9`, `.`, `+`, `-`, `*`, `/`, `Enter`, `=`, `Backspace`, `Escape`, and `%` to the same domain-engine actions the on-screen buttons dispatch; any other key is ignored (`event` not prevented, no state change).
- **Rationale**: Guarantees keyboard and button paths can never drift apart, since both call the identical domain functions (satisfies FR-007/SC-004 "identical results" by construction, not by parallel implementation).
- **Alternatives considered**: Per-button `onKeyDown` handlers — rejected because focus would have to sit on one specific button at a time for global keys like `Enter`/`Escape` to work, which fights normal keyboard-navigation expectations (Principle IV).

## 6. Styling approach

- **Decision**: A single `styles/tokens.css` defines CSS custom properties for color (including a ≥4.5:1-contrast text/background pair and a visible focus-ring color), spacing scale, border-radius, and type scale; component-level CSS files consume only these tokens, no hard-coded values.
- **Rationale**: Satisfies "look considered and consistent" (spec) and the constitution's contrast/focus requirements (Principle IV) with plain CSS, no framework (Additional Constraints).
- **Alternatives considered**: CSS-in-JS or a utility framework (e.g., Tailwind) — both explicitly excluded by the user's stack choice and the constitution's "no CSS framework" constraint.

## 7. Testing strategy

- **Decision**: Vitest unit tests cover every domain-engine function directly (all edge cases from spec.md: divide-by-zero → `N/A`, digit cap, repeated operators, repeated equals, leading zeros, decimal handling, percent-with-pending-operator). Vitest + React Testing Library component tests cover button-click and keyboard-driven user flows for each of the spec's four user stories, asserting on rendered display text only (no implementation-detail assertions).
- **Rationale**: Matches Principle III (test-first for the calculation engine) and gives every acceptance scenario in spec.md a corresponding automated test without requiring a browser E2E tool, which the requested stack doesn't include.
- **Alternatives considered**: Adding a browser-automation E2E tool (e.g., Playwright) — rejected for this feature's scope; the requested stack is Vite + React + TypeScript + Vitest only, and RTL-level component tests already exercise real DOM events (click, keydown) sufficiently for a single-page calculator.
