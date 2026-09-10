import { useEffect, useState } from "react";
import {
  backspace,
  clearAll,
  clearEntry,
  equals,
  inputDigit,
  percent,
  selectOperator,
} from "../domain/calculator";
import {
  INITIAL_STATE,
  type CalculatorState,
  type Operator,
} from "../domain/calculator.types";
import { mapKeyToAction } from "../domain/keymap";

export interface UseCalculatorResult {
  state: CalculatorState;
  onDigit: (digit: string) => void;
  onOperator: (operator: Operator) => void;
  onPercent: () => void;
  onEquals: () => void;
  onClearEntry: () => void;
  onClearAll: () => void;
  onBackspace: () => void;
}

export function useCalculator(): UseCalculatorResult {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  const onDigit = (digit: string) =>
    setState((current) => inputDigit(current, digit));
  const onOperator = (operator: Operator) =>
    setState((current) => selectOperator(current, operator));
  const onPercent = () => setState((current) => percent(current));
  const onEquals = () => setState((current) => equals(current));
  const onClearEntry = () => setState((current) => clearEntry(current));
  const onClearAll = () => setState(clearAll);
  const onBackspace = () => setState((current) => backspace(current));

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = mapKeyToAction(event.key);
      if (!action) {
        return;
      }
      switch (action.type) {
        case "digit":
          setState((current) => inputDigit(current, action.digit));
          break;
        case "operator":
          setState((current) => selectOperator(current, action.operator));
          break;
        case "percent":
          setState((current) => percent(current));
          break;
        case "equals":
          setState((current) => equals(current));
          break;
        case "clearAll":
          setState(clearAll);
          break;
        case "backspace":
          setState((current) => backspace(current));
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    state,
    onDigit,
    onOperator,
    onPercent,
    onEquals,
    onClearEntry,
    onClearAll,
    onBackspace,
  };
}
