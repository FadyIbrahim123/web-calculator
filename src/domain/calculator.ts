import {
  ERROR_DISPLAY,
  INITIAL_STATE,
  MAX_DIGITS,
  OVERFLOW_DISPLAY,
  type CalculatorState,
  type Operator,
} from "./calculator.types";

function digitCount(display: string): number {
  return display.replace(".", "").replace("-", "").length;
}

function trimTrailingZeros(numStr: string): string {
  if (!numStr.includes(".")) {
    return numStr;
  }
  return numStr.replace(/0+$/, "").replace(/\.$/, "");
}

function formatResult(value: number): string {
  if (value === 0) {
    return "0";
  }
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 10 ** MAX_DIGITS) {
    return OVERFLOW_DISPLAY;
  }
  const str = trimTrailingZeros(abs.toPrecision(MAX_DIGITS));
  if (str.includes("e") || digitCount(str) > MAX_DIGITS) {
    return OVERFLOW_DISPLAY;
  }
  return `${sign}${str}`;
}

function applyOperator(
  a: number,
  b: number,
  operator: Operator,
): number | null {
  switch (operator) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return b === 0 ? null : a / b;
  }
}

export function inputDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (state.awaitingSecondOperand || state.isError) {
    return {
      ...state,
      display: digit === "." ? "0." : digit,
      awaitingSecondOperand: false,
      isError: false,
    };
  }

  if (digit === ".") {
    if (state.display.includes(".")) {
      return state;
    }
    return { ...state, display: `${state.display}.` };
  }

  if (digitCount(state.display) >= MAX_DIGITS) {
    return {
      ...state,
      display: OVERFLOW_DISPLAY,
      isError: true,
    };
  }

  if (state.display === "0") {
    return { ...state, display: digit };
  }

  return { ...state, display: `${state.display}${digit}` };
}

export function equals(state: CalculatorState): CalculatorState {
  if (
    state.isError ||
    state.operator === null ||
    state.previousOperand === null
  ) {
    return state;
  }

  const secondOperand = Number(state.display);
  const result = applyOperator(
    state.previousOperand,
    secondOperand,
    state.operator,
  );

  if (result === null) {
    return {
      display: ERROR_DISPLAY,
      previousOperand: null,
      operator: null,
      awaitingSecondOperand: false,
      isError: true,
    };
  }

  const display = formatResult(result);
  return {
    display,
    previousOperand: null,
    operator: null,
    awaitingSecondOperand: false,
    isError: display === OVERFLOW_DISPLAY,
  };
}

export function selectOperator(
  state: CalculatorState,
  operator: Operator,
): CalculatorState {
  if (state.isError) {
    return {
      display: "0",
      previousOperand: 0,
      operator,
      awaitingSecondOperand: true,
      isError: false,
    };
  }

  if (state.operator !== null && !state.awaitingSecondOperand) {
    const resolved = equals(state);
    if (resolved.isError) {
      return resolved;
    }
    return {
      ...resolved,
      previousOperand: Number(resolved.display),
      operator,
      awaitingSecondOperand: true,
    };
  }

  if (state.operator !== null && state.awaitingSecondOperand) {
    return { ...state, operator };
  }

  return {
    ...state,
    previousOperand: Number(state.display),
    operator,
    awaitingSecondOperand: true,
  };
}

export function percent(state: CalculatorState): CalculatorState {
  if (state.isError) {
    return state;
  }

  const value = Number(state.display);
  const result =
    state.operator !== null && state.previousOperand !== null
      ? (state.previousOperand * value) / 100
      : value / 100;

  return {
    ...state,
    display: formatResult(result),
    awaitingSecondOperand: false,
  };
}

export function clearEntry(state: CalculatorState): CalculatorState {
  return { ...state, display: "0", isError: false };
}

export function clearAll(): CalculatorState {
  return INITIAL_STATE;
}

export function backspace(state: CalculatorState): CalculatorState {
  if (state.isError) {
    return { ...state, display: "0", isError: false };
  }

  if (state.display === "0" || state.display.length <= 1) {
    return { ...state, display: "0" };
  }

  return { ...state, display: state.display.slice(0, -1) };
}
