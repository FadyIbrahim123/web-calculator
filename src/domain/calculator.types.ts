export type Operator = "add" | "subtract" | "multiply" | "divide";

export interface CalculatorState {
  display: string;
  previousOperand: number | null;
  operator: Operator | null;
  awaitingSecondOperand: boolean;
  isError: boolean;
}

export const MAX_DIGITS = 10;
export const ERROR_DISPLAY = "N/A";
export const OVERFLOW_DISPLAY = "exceeded the max digits";

export const INITIAL_STATE: CalculatorState = {
  display: "0",
  previousOperand: null,
  operator: null,
  awaitingSecondOperand: false,
  isError: false,
};
