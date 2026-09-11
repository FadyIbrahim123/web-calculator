import { useRef, useState } from "react";
import { clearHistory, recordEntry, restoreState } from "../domain/history";
import type { HistoryEntry } from "../domain/history.types";
import type { CalculatorState, Operator } from "../domain/calculator.types";

export interface CompletedCalculation {
  firstOperand: number;
  operator: Operator;
  secondOperand: number;
  result: CalculatorState;
}

export interface UseHistoryResult {
  entries: HistoryEntry[];
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  addFromCalculation: (calculation: CompletedCalculation) => void;
  reuse: (entry: HistoryEntry) => CalculatorState;
  clear: () => void;
}

export function useHistory(): UseHistoryResult {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const nextId = useRef(1);

  const toggle = () => setIsOpen((open) => !open);
  const close = () => setIsOpen(false);

  const addFromCalculation = ({
    firstOperand,
    operator,
    secondOperand,
    result,
  }: CompletedCalculation) => {
    const entry: HistoryEntry = {
      id: String(nextId.current++),
      firstOperand,
      operator,
      secondOperand,
      result: result.display,
    };
    setEntries((current) => recordEntry(current, entry));
  };

  const reuse = (entry: HistoryEntry): CalculatorState => restoreState(entry);

  const clear = () => setEntries(clearHistory());

  return { entries, isOpen, toggle, close, addFromCalculation, reuse, clear };
}
