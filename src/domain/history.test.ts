import { describe, expect, it } from "vitest";
import { clearHistory, recordEntry, restoreState } from "./history";
import { MAX_HISTORY_ENTRIES, type HistoryEntry } from "./history.types";

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: "1",
    firstOperand: 12,
    operator: "add",
    secondOperand: 7,
    result: "19",
    ...overrides,
  };
}

describe("recordEntry", () => {
  it("prepends a new entry so it is most-recent-first", () => {
    const first = makeEntry({ id: "1" });
    const second = makeEntry({ id: "2" });

    const afterFirst = recordEntry([], first);
    const afterSecond = recordEntry(afterFirst, second);

    expect(afterSecond).toEqual([second, first]);
  });

  it("caps the list at MAX_HISTORY_ENTRIES, dropping the oldest entry", () => {
    let history: HistoryEntry[] = [];
    for (let i = 1; i <= MAX_HISTORY_ENTRIES; i++) {
      history = recordEntry(history, makeEntry({ id: String(i) }));
    }
    expect(history).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(history[0].id).toBe(String(MAX_HISTORY_ENTRIES));
    expect(history[MAX_HISTORY_ENTRIES - 1].id).toBe("1");

    const sixth = makeEntry({ id: "6" });
    const afterSixth = recordEntry(history, sixth);

    expect(afterSixth).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(afterSixth[0]).toEqual(sixth);
    expect(afterSixth.find((entry) => entry.id === "1")).toBeUndefined();
  });
});

describe("clearHistory", () => {
  it("returns an empty array unconditionally", () => {
    expect(clearHistory()).toEqual([]);
  });
});

describe("restoreState", () => {
  it("returns a CalculatorState showing the entry's result with no pending operation", () => {
    const entry = makeEntry({ result: "19" });

    expect(restoreState(entry)).toEqual({
      display: "19",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: false,
    });
  });
});
