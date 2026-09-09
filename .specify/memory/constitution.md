<!-- Sync Impact Report: (template) → 1.0.0, initial ratification, 5 principles + constraints + workflow + governance -->

# Web Calculator Constitution

## Core Principles

### I. Simplicity & YAGNI
Keep the implementation as simple as possible while meeting the specification. Any new dependency must have a clear written justification.

### II. Pure Logic Core
The calculation engine must remain a standalone pure module, with no dependencies on React, the DOM, or browser-specific APIs.

### III. Test-First Development
Write a unit test that fails before implementing the corresponding calculation engine functionality.

### IV. Accessibility & Responsiveness by Default
The application should support full keyboard navigation, properly labelled controls, visible focus states, a minimum contrast ratio of 4.5:1, and a usable layout at 375px.

### V. Change Tracking
Every commit that introduces a behaviour change must add a dated entry to CHANGELOG.md.

## Additional Constraints

- No `eval()` and no expression-parser packages.
- No state-management library, component library, CSS framework, or backend.

## Development Workflow

- One branch per feature, created by SpecKit.
- Commit after every workflow step (spec, clarify, plan, tasks, analyze, implement).

## Governance

This constitution applies to every feature built in this repo. Changes go through `/speckit.constitution` with a reason given. `/speckit.plan` should check the plan against these principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
