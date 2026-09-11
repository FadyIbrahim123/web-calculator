# Feature Specification: Calculation History

**Feature Branch**: `[002-calculation-history]`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Add calculation history. The calculator keeps a short history of recent calculations. The user can see them, reuse one, and clear the list. The history must not get in the way on a small screen. The spec must state how history relates to what already exists, and must not silently redefine round 1's behaviour. If it needs to change something you already shipped, say so explicitly — that is a breaking change, not a detail."

## Relationship to Existing Calculator (Round 1)

This feature adds a **new, additive capability** on top of the calculator delivered in `001-web-calculator`. It does not change how any existing button, keyboard key, or calculation behaves: entering numbers, the four operators, percentage, clear-entry, clear-all, delete-last-digit, the 10-digit cap, and the `N/A` error state all continue to work exactly as specified in round 1.

**Explicit breaking change to round 1**: Round 1's spec recorded, as a documented assumption, that *"No memory functions (M+, M-, MR, MC), calculation history, or persistence across page reloads are in scope; each session starts fresh from zero."* This feature deliberately supersedes the **calculation history** portion of that assumption — history is now in scope. The "each session starts fresh from zero" behavior for the **active calculation** (the display, pending operator, and stored operand) is unchanged; only the retention of a separate, historical list of past results is new. Whether that history list itself survives a page reload is resolved below (see Clarifications) rather than silently assumed either way.

Architecturally, history sits **on top of** round 1's calculation engine, not inside it: the engine remains the sole source of truth for arithmetic and stays completely unaware that history exists (see FR-011). History only observes calculations the engine has already completed.

## Clarifications

- Q: Does the calculation history persist across a page reload/browser restart, or does it reset along with the rest of the calculator state? → A: Session-only — history is held in memory and clears on page reload/close, matching round 1's "fresh start" behavior for the active calculation. No calculation values are written to persistent device storage.

- Q: What happens when the user selects a history entry to "reuse" it? → A: The entire original expression (first operand, operator, second operand) is recalled and it replaces whatever is currently displayed/in progress — not appended to it. The display then shows that expression's result, as if the user had just retyped and computed it. (Supersedes the "result only" answer recorded during initial specification.)
- Q: How many entries does the "short" history list retain, and what happens to the oldest one past that limit? → A: 5 most recent entries. Once a 6th calculation completes, the oldest entry is dropped and is not shown or accessible anywhere.
- Q: On a narrow phone screen (375px), where does the history panel sit relative to the keypad — beside it, below it, or behind it? → A: Behind — a hidden-by-default overlay/drawer toggled open by the user. The keypad's position, size, and layout are never altered by history's presence, whether it's open or closed. This also keeps the history UI a separate layer from the engine and the primary keypad, reinforcing that history cannot "contaminate" either.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review recent calculations (Priority: P1)

After performing one or more calculations, a user wants to glance back at what they recently computed — both the expression and the result — without having to remember or re-enter it.

**Why this priority**: Being able to see history is the foundation of the feature; reuse and clear are only meaningful once history is visible.

**Independent Test**: Can be fully tested by completing several calculations, opening the history view, and confirming each entry shows the expression and result that were actually computed, most recent first.

**Acceptance Scenarios**:

1. **Given** the calculator is freshly opened with no calculations yet performed, **When** the user opens the history view, **Then** it shows an empty state (no entries) rather than an error or blank crash.
2. **Given** the user computes `12 + 7 =` and then `6 × 7 =`, **When** the user opens the history view, **Then** it lists both calculations with their expressions and results, with `6 × 7 = 42` shown above `12 + 7 = 19` (most recent first).
3. **Given** the history already contains entries, **When** the user completes a new calculation, **Then** the new entry appears at the top of the list without the user needing to manually refresh the view.
4. **Given** the user performs 6 calculations in a row, **When** the user opens the history view, **Then** only the 5 most recent are shown and the oldest (the 1st) has been dropped silently, with no error.
5. **Given** a calculation results in an error state (e.g., divide-by-zero showing `N/A`), **When** the user opens the history view, **Then** that failed calculation is not added as a reusable history entry.

---

### User Story 2 - Reuse a past calculation (Priority: P2)

A user sees a calculation they ran a moment ago and wants to recall the whole thing — not just its result — replacing whatever they're currently doing, instead of retyping it.

**Why this priority**: Viewing history has some value on its own, but reuse is what turns it into a real time-saver; it is a natural follow-on once history exists.

**Independent Test**: Can be fully tested by completing a calculation, selecting its history entry, and confirming the calculator recalls that entry's full expression and shows its result, replacing anything that was previously displayed or in progress.

**Acceptance Scenarios**:

1. **Given** the history contains an entry `12 + 7 = 19`, **When** the user selects that entry, **Then** the calculator recalls the full expression (`12`, `+`, `7`) and the display shows `19`, the result of that expression, as if the user had just retyped and computed `12 + 7`.
2. **Given** the user has a calculation already in progress (e.g., they typed `45` and pressed `+`), **When** the user selects a history entry `12 + 7 = 19`, **Then** the in-progress `45 +` calculation is discarded entirely and replaced by the recalled expression, with the display showing `19`.
3. **Given** the user selects a history entry and its expression has been recalled, **When** the user then presses an operator, enters a second number, and presses equals, **Then** the calculation proceeds normally from the recalled result and (if completed) is itself added as a new history entry.
4. **Given** the user selects a history entry, **When** the selection completes, **Then** the history list itself is unchanged (the reused entry is not removed or reordered).

---

### User Story 3 - Clear the history list (Priority: P3)

A user wants to remove all past calculations from the history, for example to start with a clean list.

**Why this priority**: Clearing is a supporting convenience — useful, but the calculator remains fully functional without it since history is capped and non-sensitive by default (session-only).

**Independent Test**: Can be fully tested by populating history with entries, triggering clear, and confirming the list becomes empty and stays empty until a new calculation is completed.

**Acceptance Scenarios**:

1. **Given** the history contains several entries, **When** the user clears the history, **Then** the history view immediately shows the empty state.
2. **Given** the history has just been cleared, **When** the user completes a new calculation, **Then** it appears as the sole entry in the history.
3. **Given** the history is already empty, **When** the user triggers clear again, **Then** nothing happens and no error occurs.
4. **Given** the user clears the history, **When** this action completes, **Then** the calculator's current display/active calculation is unaffected (clearing history is independent of clear-entry/clear-all for the active calculation).

---

### Edge Cases

- The history view/toggle MUST NOT cause any existing calculator control (digits, operators, equals, clear buttons) to become overlapped, clipped, or unreachable on small phone screens (down to the 320px width round 1 already supports).
- On a narrow screen, the history is not shown expanded by default; it lives behind an explicit toggle as a hidden overlay/drawer, so its presence never resizes, reflows, or otherwise competes with the keypad for space.
- Opening/closing the history view does not interrupt or alter an in-progress calculation (the current display, pending operator, and stored operand are preserved).
- A history entry's expression respects the same 10-digit display cap and `N/A`/error formatting rules already defined for the live display, if applicable to what's shown for each operand/result.
- Rapid, repeated completion of calculations (e.g., many quick equals presses) does not duplicate history entries, corrupt ordering, or crash the view.
- Rapid, repeated selection of the same or different history entries does not freeze the display or leave it in an inconsistent state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calculator MUST record a history entry — the full expression (operands and operator) and its result — each time a calculation completes successfully via equals.
- **FR-002**: The calculator MUST NOT add a history entry for a calculation that ends in an error state (e.g., divide-by-zero `N/A`) or that never reaches equals.
- **FR-003**: The calculator MUST let the user view the recorded history entries, ordered most-recent-first.
- **FR-004**: The calculator MUST retain only the 5 most recent history entries; once a 6th calculation completes, the oldest entry MUST be dropped and MUST NOT remain shown or accessible anywhere.
- **FR-005**: The calculator MUST let the user select any history entry to reuse it; doing so MUST recall that entry's full original expression (first operand, operator, second operand) and replace any calculation currently displayed or in progress, with the display showing the recalled expression's result, without altering the history list itself.
- **FR-006**: The calculator MUST let the user clear all history entries in one action, after which the history view shows an empty state; clearing history MUST NOT affect the active calculation (current display, pending operator, stored operand).
- **FR-007**: The calculator MUST show a non-error empty state when no history entries exist yet (fresh session or after clearing).
- **FR-008**: The history view MUST be presented so that, at all supported screen widths including small phones, no existing calculator control (digits, operators, percent, equals, clear-entry, clear-all, delete-last-digit) becomes overlapped, clipped, or unreachable. On narrow screens (down to 375px) the history MUST be a hidden-by-default overlay/drawer sitting behind the keypad, reachable via an explicit show/hide toggle, such that opening or closing it never resizes, reflows, or repositions the keypad.
- **FR-009**: The calculator MUST hold history entries only in memory for the current page session; history MUST reset when the page is reloaded or closed, and MUST NOT be written to persistent device storage.
- **FR-010**: All calculation behavior specified in round 1 (`001-web-calculator`) — arithmetic, percentage, clear-entry, clear-all, delete-last-digit, keyboard bindings, the 10-digit cap, and `N/A` error handling — MUST remain unchanged by this feature.
- **FR-011**: The history feature MUST be implemented as a passive observer of calculations the engine has already completed; it MUST NOT modify, extend, or otherwise reach into the core calculation engine's internal state or logic delivered in round 1 — the engine MUST remain fully functional and unaware of history if the history feature were removed.

### Key Entities

- **History Entry**: Represents one completed calculation. Includes the expression that was evaluated (first operand, operator, second operand — including any percentage step), the resulting value, and its recency relative to other entries (used for most-recent-first ordering). Exists only in memory for the current page session; not saved or shared.
- **History List**: The bounded, ordered collection of History Entries currently retained, most recent first, capped at 5 entries with the oldest evicted first once a new one is added past that cap.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After completing a calculation, the user can see it reflected in the history view within 1 second, with no manual refresh.
- **SC-002**: A user can reuse any visible history entry to start a new calculation in a single interaction (one selection), instead of retyping the number.
- **SC-003**: A user can clear the entire history in a single action, with the empty state visible immediately afterward.
- **SC-004**: At screen widths from 320px (small phone) through common desktop widths, 100% of existing calculator controls remain fully visible, unclipped, and operable whether the history view is shown or hidden.
- **SC-005**: 100% of calculations that complete successfully (reach equals with a valid result) appear in history; 100% of calculations that end in an error state do not.
- **SC-006**: Reloading the page always returns the calculator to an empty history and a fresh active calculation, with no leftover state from the prior session.

## Assumptions

- History is session-only (in memory, cleared on reload) rather than persisted to device storage, primarily to avoid unexpectedly retaining a user's numeric data (which may be sensitive, e.g. financial figures) beyond the current visit on a possibly shared device (see Clarifications). This narrows, rather than contradicts, round 1's original "no persistence" assumption: the active calculation still never persists, and now history explicitly doesn't either.
- The history view is a supplementary overlay/drawer (see Clarifications) rather than a replacement for the main display; it does not need its own dedicated full-screen mode.
- Keeping the engine unaware of history (FR-011) is treated as a hard architectural boundary, not just a style preference — round 1's calculation engine must keep working correctly even if the history UI were deleted entirely.
- No editing of individual history entries (e.g., renaming, pinning, deleting a single entry) is in scope — only viewing, reusing, and clearing the whole list, per the request.
- No export, sharing, search, or filtering of history entries is in scope.
- The calculator remains a single-user, client-side tool; history is not synced across devices or tabs.
