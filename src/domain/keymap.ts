import type { Operator } from "./calculator.types";

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "operator"; operator: Operator }
  | { type: "percent" }
  | { type: "equals" }
  | { type: "clearAll" }
  | { type: "backspace" };

const DIGIT_KEYS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]);

const OPERATOR_KEYS: Record<string, Operator> = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
};

export function mapKeyToAction(key: string): CalculatorAction | null {
  if (DIGIT_KEYS.has(key)) {
    return { type: "digit", digit: key };
  }
  if (key in OPERATOR_KEYS) {
    return { type: "operator", operator: OPERATOR_KEYS[key] };
  }
  if (key === "%") {
    return { type: "percent" };
  }
  if (key === "Enter" || key === "=") {
    return { type: "equals" };
  }
  if (key === "Backspace") {
    return { type: "backspace" };
  }
  if (key === "Escape") {
    return { type: "clearAll" };
  }
  return null;
}
