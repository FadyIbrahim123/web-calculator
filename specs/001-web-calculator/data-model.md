# Data Model: Web Calculator

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

There is no database and no persisted data — this document describes the one in-memory entity the domain engine (`src/domain/`) operates on, expanding on spec.md's Key Entities section into concrete fields and transitions.

## Entity: Calculation State

The complete state of a single, in-progress or just-completed calculation. Lives only in memory for the current page session (spec Assumptions: no history, no persistence across reloads).

| Field | Type | Description |
|---|---|---|
| `display` | `string` | The value currently shown to the user — a number as typed/computed, or the literal string `"N/A"` (error) or `"exceeded the max digits"` (overflow). |
| `previousOperand` | `number \| null` | The first operand, stored once an operator has been chosen; `null` when no operation is pending. |
| `operator` | `"add" \| "subtract" \| "multiply" \| "divide" \| null` | The pending operator; `null` when no operation is pending. |
| `awaitingSecondOperand` | `boolean` | `true` immediately after an operator is chosen, before the user types the next digit — lets digit entry know whether to start a fresh number or continue the current one. |
| `isError` | `boolean` | `true` when `display` holds `"N/A"` or `"exceeded the max digits"`; any digit press while `true` clears the error and starts a new entry (FR-016). |

### Validation rules (from spec Functional Requirements)

- `display` never contains more than 10 digits (FR-017); a digit press that would exceed this is ignored.
- `display` never contains more than one decimal point (FR-010).
- Leading zeros are normalized away as digits are typed (FR-010) — e.g., `"00007"` is never a reachable `display` value; it collapses to `"7"`.
- `operator` can only ever hold one pending value at a time; selecting a new operator while one is already pending replaces it rather than stacking (edge case: `5 + × 3 =` behaves as `5 × 3 =`).
- Dividing by zero sets `display` to `"N/A"` and `isError` to `true` (FR-009) instead of producing `Infinity`/`NaN`.

### State transitions

Each user action (button click or equivalent keyboard key, per FR-007) maps to one pure transition function taking the current state and returning the next state. No transition ever throws or produces an unrepresentable state — every input, including the "odd" ones called out in spec Edge Cases, maps to a defined next state.

| Action | Effect |
|---|---|
| Digit (`0`-`9`, `.`) | Appended to `display` (respecting the 10-digit cap and single-decimal-point rule); if `awaitingSecondOperand` or `isError` is `true`, starts a fresh entry instead of appending. |
| Operator (`+`, `-`, `×`, `÷`) | If no operator is pending, stores `display` into `previousOperand`, sets `operator`, sets `awaitingSecondOperand = true`. If an operator is already pending and a second operand has been entered, first resolves the pending calculation (same as Equals), then stores the new operator. If an operator is pending but no second operand was entered yet, simply replaces `operator`. |
| Percent (`%`) | Converts `display` per the clarified rule: `value / 100` standalone, or `(previousOperand * value) / 100` when `operator` is pending — see spec Clarifications. |
| Equals (`=` / `Enter`) | If an operator and second operand are present, computes the result, rounds/caps it per FR-017, writes it to `display`, and clears `previousOperand`/`operator`. If pressed with no pending operation, or repeatedly with no new input, is a no-op (spec Assumptions). |
| Clear Entry (CE) | Resets `display` to `"0"` only; `previousOperand`, `operator`, and `awaitingSecondOperand` are untouched (FR-004). |
| Clear All (C/AC) | Resets every field to its initial state (FR-005). |
| Delete last digit (Backspace) | Removes the last character of `display`; if `display` is already `"0"` (or empty), it's a no-op, never producing a negative-length or invalid value (FR-006). |

### Initial state

```text
{ display: "0", previousOperand: null, operator: null, awaitingSecondOperand: false, isError: false }
```

This is also the state after Clear All, and the target the UI should render on first page load.
