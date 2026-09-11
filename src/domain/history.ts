import type { CalculatorState } from "./calculator.types";
import { MAX_HISTORY_ENTRIES, type HistoryEntry } from "./history.types";

export function recordEntry(
  history: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
}

export function clearHistory(): HistoryEntry[] {
  return [];
}

export function restoreState(entry: HistoryEntry): CalculatorState {
  return {
    display: entry.result,
    previousOperand: null,
    operator: null,
    awaitingSecondOperand: false,
    isError: false,
  };
}
