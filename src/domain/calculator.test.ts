import { describe, expect, it } from "vitest";
import {
  backspace,
  clearAll,
  clearEntry,
  equals,
  inputDigit,
  percent,
  selectOperator,
} from "./calculator";
import { INITIAL_STATE, type CalculatorState } from "./calculator.types";

describe("inputDigit", () => {
  it("appends a digit to the display", () => {
    const next = inputDigit(INITIAL_STATE, "5");
    expect(next.display).toBe("5");
  });

  it("appends successive digits", () => {
    let state = inputDigit(INITIAL_STATE, "1");
    state = inputDigit(state, "2");
    expect(state.display).toBe("12");
  });

  it("normalizes a leading zero away when a non-zero digit follows", () => {
    const next = inputDigit(INITIAL_STATE, "7");
    expect(next.display).toBe("7");
  });

  it("does not accumulate redundant leading zeros", () => {
    const next = inputDigit(INITIAL_STATE, "0");
    expect(next.display).toBe("0");
  });

  it("starts a decimal number at 0. when the decimal point is pressed on an empty entry", () => {
    const next = inputDigit(INITIAL_STATE, ".");
    expect(next.display).toBe("0.");
  });

  it("allows only one decimal point per number", () => {
    let state = inputDigit(INITIAL_STATE, "1");
    state = inputDigit(state, ".");
    state = inputDigit(state, "5");
    state = inputDigit(state, ".");
    expect(state.display).toBe("1.5");
  });

  it("shows the overflow message when digit entry exceeds 10 digits", () => {
    let state: CalculatorState = { ...INITIAL_STATE, display: "1234567890" };
    state = inputDigit(state, "1");
    expect(state.display).toBe("exceeded the max digits");
    expect(state.isError).toBe(true);
  });

  it("does not count the decimal point against the 10-digit cap", () => {
    let state: CalculatorState = { ...INITIAL_STATE, display: "123456789" };
    state = inputDigit(state, ".");
    state = inputDigit(state, "0");
    expect(state.display).toBe("123456789.0");
  });

  it("starts a fresh entry instead of appending when awaiting the second operand", () => {
    const state: CalculatorState = {
      display: "3",
      previousOperand: 5,
      operator: "add",
      awaitingSecondOperand: true,
      isError: false,
    };
    const next = inputDigit(state, "7");
    expect(next.display).toBe("7");
    expect(next.awaitingSecondOperand).toBe(false);
    expect(next.previousOperand).toBe(5);
    expect(next.operator).toBe("add");
  });

  it("clears an error state and starts a fresh entry when a digit is typed", () => {
    const errorState: CalculatorState = equals({
      display: "0",
      previousOperand: 5,
      operator: "divide",
      awaitingSecondOperand: false,
      isError: false,
    });
    expect(errorState.display).toBe("N/A");

    const next = inputDigit(errorState, "7");
    expect(next.display).toBe("7");
    expect(next.isError).toBe(false);
  });

  it("starts a fresh decimal entry (0.) when the decimal point is pressed right after an error", () => {
    const errorState: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    const next = inputDigit(errorState, ".");
    expect(next.display).toBe("0.");
    expect(next.isError).toBe(false);
  });
});

describe("selectOperator", () => {
  it("stores the first operand and the chosen operator", () => {
    const state: CalculatorState = { ...INITIAL_STATE, display: "5" };
    const next = selectOperator(state, "add");
    expect(next.previousOperand).toBe(5);
    expect(next.operator).toBe("add");
    expect(next.awaitingSecondOperand).toBe(true);
  });

  it("replaces an already-pending operator when no second operand was entered yet", () => {
    const state: CalculatorState = {
      display: "5",
      previousOperand: 5,
      operator: "add",
      awaitingSecondOperand: true,
      isError: false,
    };
    const next = selectOperator(state, "subtract");
    expect(next.operator).toBe("subtract");
    expect(next.previousOperand).toBe(5);
  });

  it("resolves the pending calculation before applying a newly chosen operator", () => {
    const state: CalculatorState = {
      display: "3",
      previousOperand: 5,
      operator: "add",
      awaitingSecondOperand: false,
      isError: false,
    };
    const next = selectOperator(state, "multiply");
    expect(next.previousOperand).toBe(8);
    expect(next.display).toBe("8");
    expect(next.operator).toBe("multiply");
  });

  it("discards an error state and starts fresh when an operator is pressed", () => {
    const state: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    const next = selectOperator(state, "add");
    expect(next.isError).toBe(false);
    expect(next.previousOperand).toBe(0);
    expect(next.operator).toBe("add");
    expect(next.awaitingSecondOperand).toBe(true);
  });
});

describe("equals", () => {
  function pending(
    display: string,
    previousOperand: number,
    operator: CalculatorState["operator"],
  ): CalculatorState {
    return {
      display,
      previousOperand,
      operator,
      awaitingSecondOperand: false,
      isError: false,
    };
  }

  it("adds two operands", () => {
    expect(equals(pending("7", 12, "add")).display).toBe("19");
  });

  it("subtracts two operands", () => {
    expect(equals(pending("15", 9, "subtract")).display).toBe("-6");
  });

  it("multiplies two operands", () => {
    expect(equals(pending("7", 6, "multiply")).display).toBe("42");
  });

  it("divides two operands", () => {
    expect(equals(pending("4", 20, "divide")).display).toBe("5");
  });

  it("shows N/A on divide-by-zero instead of Infinity or NaN", () => {
    const next = equals(pending("0", 5, "divide"));
    expect(next.display).toBe("N/A");
    expect(next.isError).toBe(true);
  });

  it("clears the pending operator/operand once computed", () => {
    const next = equals(pending("7", 12, "add"));
    expect(next.operator).toBeNull();
    expect(next.previousOperand).toBeNull();
  });

  it("shows the overflow message when a result exceeds 10 digits", () => {
    const next = equals(pending("1000000000", 1000000000, "multiply"));
    expect(next.display).toBe("exceeded the max digits");
    expect(next.isError).toBe(true);
  });

  it("is a no-op when there is no pending operation", () => {
    const state: CalculatorState = { ...INITIAL_STATE, display: "42" };
    expect(equals(state)).toEqual(state);
  });

  it("is idempotent when pressed repeatedly with no new input", () => {
    const once = equals(pending("7", 12, "add"));
    const twice = equals(once);
    expect(twice).toEqual(once);
  });

  it("is a no-op while in an error state", () => {
    const state: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    expect(equals(state)).toEqual(state);
  });
});

describe("clearEntry", () => {
  it("resets only the current entry, preserving the pending operator and first operand", () => {
    const state: CalculatorState = {
      display: "123",
      previousOperand: 5,
      operator: "add",
      awaitingSecondOperand: false,
      isError: false,
    };
    const next = clearEntry(state);
    expect(next.display).toBe("0");
    expect(next.previousOperand).toBe(5);
    expect(next.operator).toBe("add");
  });

  it("clears an error state back to a usable display", () => {
    const state: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    const next = clearEntry(state);
    expect(next.display).toBe("0");
    expect(next.isError).toBe(false);
  });
});

describe("clearAll", () => {
  it("resets every field to the initial state", () => {
    expect(clearAll()).toEqual(INITIAL_STATE);
  });
});

describe("backspace", () => {
  it("removes the last character of the display", () => {
    const state: CalculatorState = { ...INITIAL_STATE, display: "123" };
    expect(backspace(state).display).toBe("12");
  });

  it("falls back to 0 once the last digit is removed", () => {
    const state: CalculatorState = { ...INITIAL_STATE, display: "5" };
    expect(backspace(state).display).toBe("0");
  });

  it("is a no-op when the display is already 0", () => {
    expect(backspace(INITIAL_STATE)).toEqual(INITIAL_STATE);
  });

  it("clears an error state back to 0 instead of deleting a character from N/A", () => {
    const state: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    const next = backspace(state);
    expect(next.display).toBe("0");
    expect(next.isError).toBe(false);
  });
});

describe("percent", () => {
  it("converts the current entry to a hundredth of its value when standalone", () => {
    const state: CalculatorState = { ...INITIAL_STATE, display: "50" };
    expect(percent(state).display).toBe("0.5");
  });

  it("computes the percentage relative to the first operand when an operator is pending", () => {
    const state: CalculatorState = {
      display: "10",
      previousOperand: 200,
      operator: "add",
      awaitingSecondOperand: false,
      isError: false,
    };
    expect(percent(state).display).toBe("20");
  });

  it("leaves the pending operator and first operand untouched, ready for equals", () => {
    const state: CalculatorState = {
      display: "10",
      previousOperand: 200,
      operator: "add",
      awaitingSecondOperand: false,
      isError: false,
    };
    const afterPercent = percent(state);
    expect(equals(afterPercent).display).toBe("220");
  });

  it("returns 0 for percent pressed on an empty/zero entry", () => {
    expect(percent(INITIAL_STATE).display).toBe("0");
  });

  it("is a no-op while in an error state", () => {
    const state: CalculatorState = {
      display: "N/A",
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
    expect(percent(state)).toEqual(state);
  });
});
