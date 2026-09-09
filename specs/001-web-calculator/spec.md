# Feature Specification: Web Calculator

**Feature Branch**: `[001-web-calculator]`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Build a web calculator. A user opens the page and can perform everyday arithmetic: addition, subtraction, multiplication, division, and percentages. They can clear the current entry, clear everything, and delete the last digit. They can use the on-screen buttons or their keyboard. It must not crash or show nonsense when the user does something odd. It must look considered and consistent, and it must work on a phone."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Perform a basic calculation (Priority: P1)

A user opens the calculator and computes the result of a simple arithmetic expression, such as one number, an operator, a second number, and equals.

**Why this priority**: This is the core reason the calculator exists. Without correct arithmetic, nothing else matters.

**Independent Test**: Can be fully tested by entering a first number, choosing an operator (add, subtract, multiply, or divide), entering a second number, pressing equals, and confirming the displayed result is mathematically correct.

**Acceptance Scenarios**:

1. **Given** the calculator is freshly opened showing zero, **When** the user enters `12`, presses `+`, enters `7`, and presses `=`, **Then** the display shows `19`.
2. **Given** the calculator is freshly opened, **When** the user enters `9`, presses `-`, enters `15`, and presses `=`, **Then** the display shows `-6`.
3. **Given** the calculator is freshly opened, **When** the user enters `6`, presses `×`, enters `7`, and presses `=`, **Then** the display shows `42`.
4. **Given** the calculator is freshly opened, **When** the user enters `20`, presses `÷`, enters `4`, and presses `=`, **Then** the display shows `5`.
5. **Given** a result is already showing, **When** the user starts entering a new number, **Then** the calculator begins a new calculation rather than appending to the old result.

---

### User Story 2 - Correct a mistake mid-entry (Priority: P2)

A user makes a typing mistake while entering a number or wants to abandon the whole calculation, and needs a reliable way to fix it without losing more work than necessary.

**Why this priority**: Arithmetic errors from mistyped numbers are common; without a graceful correction path, users lose trust in the tool and re-enter everything from scratch every time.

**Independent Test**: Can be fully tested by entering digits, then using delete-last-digit, clear-entry, and clear-all in isolation, and confirming each affects only the scope it claims to (last digit, current entry, or the whole calculation).

**Acceptance Scenarios**:

1. **Given** the user has typed `123`, **When** they press delete-last-digit once, **Then** the display shows `12`.
2. **Given** the user has typed `123` as the second operand of a pending operation, **When** they press clear-entry, **Then** the current entry resets to `0` but the pending operator and first operand are preserved.
3. **Given** the user is mid-calculation (e.g., `45 +` entered), **When** they press clear-all, **Then** the display resets to `0` and any pending operator or stored operand is discarded.
4. **Given** the display shows `0`, **When** the user presses delete-last-digit, **Then** the display remains `0` (no error, no negative-length result).

---

### User Story 3 - Calculate a percentage (Priority: P3)

A user wants to find a percentage of a number, such as a tip or discount, without doing the division themselves.

**Why this priority**: Percentages are called out explicitly as everyday arithmetic the calculator must support, but they are used less frequently than the four basic operators.

**Independent Test**: Can be fully tested by entering a number, pressing percent, and confirming the displayed value is the correct percentage conversion, both standalone and as part of a chained operation (e.g., adding a percentage to a total).

**Acceptance Scenarios**:

1. **Given** the display shows `50`, **When** the user presses `%`, **Then** the display shows `0.5`.
2. **Given** the user has entered `200`, pressed `+`, and entered `10`, **When** they press `%`, **Then** the calculator treats the percentage as 10% of `200` (i.e., `20`) for the pending addition.
3. **Given** the user completes a percentage-based calculation, **When** they press `=`, **Then** the final result is mathematically correct for the interpreted operation.

---

### User Story 4 - Operate entirely from the keyboard (Priority: P4)

A user who prefers not to reach for the mouse/touchscreen performs an entire calculation using only their keyboard.

**Why this priority**: Keyboard support is explicitly required and is a meaningful accessibility and power-user convenience, but the calculator is already usable via on-screen buttons without it, so it can ship as a follow-on to the button-driven flows.

**Independent Test**: Can be fully tested by performing every action available on-screen (digits, operators, percent, equals, clear-entry, clear-all, delete-last-digit) using only keyboard keys, with no mouse or touch input, and confirming identical results to the button-driven flows.

**Acceptance Scenarios**:

1. **Given** the calculator has keyboard focus, **When** the user types `12`, `+`, `7`, and presses `Enter`, **Then** the display shows `19`, matching the on-screen-button equivalent.
2. **Given** the user has typed a number, **When** they press `Backspace`, **Then** the last digit is removed, matching the delete-last-digit button.
3. **Given** the user is mid-calculation, **When** they press `Escape`, **Then** the calculator clears everything, matching the clear-all button.
4. **Given** the calculator has keyboard focus, **When** the user presses a key with no assigned function (e.g., a letter key), **Then** nothing happens and no error or crash occurs.

---

### Edge Cases

- Dividing by zero must not crash the app or show a raw error code; the calculator shows a clear, human-readable indication (e.g., "Error") and lets the user recover by clearing or starting a new entry.
- Pressing an operator immediately after another operator replaces the pending operator rather than stacking or crashing (e.g., `5 + × 3 =` behaves as `5 × 3 =`).
- Pressing `=` with no second operand entered does not crash and does not produce a nonsensical result (e.g., repeats the current value or is a no-op).
- Pressing `=` repeatedly with no new input between presses does not change the result or crash.
- Typing multiple decimal points in one number (e.g., `1.2.3`) is prevented or ignored after the first decimal point.
- Leading zeros are normalized (e.g., typing `00007` behaves as `7`).
- Pressing decimal point on an empty entry starts the number at `0.`.
- Results or intermediate values that exceed the display's width are shown in a truncated or abbreviated form rather than breaking the layout or wrapping off-screen.
- Rapid or repeated button presses (mouse or keyboard) do not cause the display to freeze, duplicate digits unexpectedly, or crash the app.
- Percent pressed on `0` or on an empty entry returns `0` rather than an error.
- Very small screens (narrow phones) show all buttons without horizontal scrolling, overlap, or clipped text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calculator MUST let users enter multi-digit numbers, including decimals, via on-screen digit buttons.
- **FR-002**: The calculator MUST perform addition, subtraction, multiplication, and division between two operands and display a correct result.
- **FR-003**: The calculator MUST perform percentage conversion of the current entry, and MUST apply it correctly relative to a pending operation when one exists.
- **FR-004**: The calculator MUST provide a clear-entry control that resets only the number currently being entered, without discarding a pending operator or the first operand.
- **FR-005**: The calculator MUST provide a clear-all control that resets the entire calculation (display, pending operator, and stored operand) back to its initial state.
- **FR-006**: The calculator MUST provide a delete-last-digit control that removes the most recently entered digit of the current entry, and is a no-op (not an error) when the entry is already empty/zero.
- **FR-007**: Every action available via an on-screen button (digits, operators, percent, equals, clear-entry, clear-all, delete-last-digit) MUST also be triggerable from the keyboard.
- **FR-008**: The calculator MUST display the current entry or result at all times, updating immediately as the user interacts with it.
- **FR-009**: The calculator MUST handle division by zero, and any other invalid or undefined operation, by showing a clear, human-readable error state rather than crashing, freezing, or displaying a raw code, `NaN`, `undefined`, or `Infinity`.
- **FR-010**: The calculator MUST prevent or gracefully normalize malformed number entry, including multiple decimal points in a single number and redundant leading zeros.
- **FR-011**: The calculator MUST ignore input that has no defined effect (e.g., unmapped keyboard keys, pressing equals with no pending operation) without crashing or corrupting the displayed state.
- **FR-012**: The calculator's layout MUST remain fully usable, with no overlapping, clipped, or off-screen controls, on phone-sized screens as well as larger screens.
- **FR-013**: The calculator MUST present a single, visually consistent design across all controls (consistent spacing, sizing, and styling for buttons and display).
- **FR-014**: On-screen controls MUST be large enough to comfortably operate by touch on a phone screen.
- **FR-015**: Interactive controls MUST show a visible focus indicator when navigated to via keyboard.
- **FR-016**: Recovering from an error state (e.g., after divide-by-zero) MUST be possible by pressing clear-all, or by clear-entry/starting a new number entry, without reloading the page.

### Key Entities

- **Calculation State**: Represents the in-progress or completed calculation the user is working on. Includes the value currently displayed, the first operand (when an operation is pending), the selected operator (add, subtract, multiply, divide, or none), and whether the calculator is in an error state. Exists only for the current session; not saved or shared.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete a simple two-operand calculation (e.g., "12 + 7") and see the correct result in under 5 seconds using only on-screen buttons.
- **SC-002**: 100% of valid addition, subtraction, multiplication, division, and percentage calculations tested produce mathematically correct results.
- **SC-003**: No sequence of button presses or key presses — including divide-by-zero, consecutive operators, repeated equals, or unmapped keys — causes the application to crash, freeze, or display a raw error code, `NaN`, `undefined`, or `Infinity`.
- **SC-004**: Every action reachable via on-screen buttons is also completable using the keyboard alone, with identical results.
- **SC-005**: The calculator is fully operable, with no overlapping, clipped, or off-screen controls, at screen widths from 320px (small phone) through common desktop widths.
- **SC-006**: In an informal first-use check, a person unfamiliar with the app correctly identifies and uses clear-entry, clear-all, and delete-last-digit without being told what they do.

## Assumptions

- Percentage behavior follows common calculator convention: pressed standalone, it converts the current entry to a hundredth of its value (e.g., `50` → `0.5`); pressed as part of a pending operation, it is computed relative to the first operand (e.g., `200 + 10% = 220`).
- Pressing equals repeatedly with no new input in between is idempotent (no repeated re-application of the last operation) — this avoids ambiguity around "chained equals" behavior that wasn't specified.
- No memory functions (M+, M-, MR, MC), calculation history, or persistence across page reloads are in scope; each session starts fresh from zero.
- No advanced operations (square root, exponents, parentheses, trigonometry) are in scope — only addition, subtraction, multiplication, division, and percentage, as stated in the request.
- The calculator is a single-user, client-side tool with no accounts, sign-in, or backend/network dependency.
- "Considered and consistent" visual design is treated as a qualitative requirement to be judged by internal review (no specific brand/style guide was provided).
- Standard base-10 decimal entry only; no scientific notation input or unit conversion features.
