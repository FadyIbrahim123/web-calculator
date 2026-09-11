import type { Operator } from "./calculator.types";

export interface HistoryEntry {
  id: string;
  firstOperand: number;
  operator: Operator;
  secondOperand: number;
  result: string;
}

export const MAX_HISTORY_ENTRIES = 5;
