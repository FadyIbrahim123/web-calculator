# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- 2026-09-10: Initial web calculator — addition, subtraction, multiplication, division, and percentage, with clear-entry, clear-all, and delete-last-digit; usable by mouse/touch and keyboard; divide-by-zero and digit-overflow handled without crashing.
- 2026-09-11: Calculation history — view the 5 most recent completed calculations behind a hidden-by-default toggle/overlay, reuse one to recall its full expression, and clear the list; session-only (resets on reload, never persisted). Implemented entirely as a layer on top of the existing calculation engine, which is unmodified by this change.
