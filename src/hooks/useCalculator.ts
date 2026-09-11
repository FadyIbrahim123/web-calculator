import { useEffect, useRef, useState } from "react";
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

export interface EqualsCompletion {
  firstOperand: number;
  operator: Operator;
  secondOperand: number;
  result: CalculatorState;
}

export interface UseCalculatorResult {
  state: CalculatorState;
  onDigit: (digit: string) => void;
  onOperator: (operator: Operator) => void;
  onPercent: () => void;
  onEquals: () => void;
  onClearEntry: () => void;
  onClearAll: () => void;
  onBackspace: () => void;
  onRestore: (state: CalculatorState) => void;
}

export function useCalculator(
  onEqualsComplete?: (completion: EqualsCompletion) => void,
): UseCalculatorResult {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  // Mirror `state` and `onEqualsComplete` for the keydown listener below,
  // whose closure is fixed at mount (empty effect deps) and would
  // otherwise see stale values for both.
  const stateRef = useRef(state);
  stateRef.current = state;
  const onEqualsCompleteRef = useRef(onEqualsComplete);
  onEqualsCompleteRef.current = onEqualsComplete;

  function reportEqualsCompletion(pre: CalculatorState, result: CalculatorState) {
    const onEqualsComplete = onEqualsCompleteRef.current;
    if (
      onEqualsComplete &&
      !pre.isError &&
      pre.operator !== null &&
      pre.previousOperand !== null &&
      !result.isError
    ) {
      onEqualsComplete({
        firstOperand: pre.previousOperand,
        operator: pre.operator,
        secondOperand: Number(pre.display),
        result,
      });
    }
  }

  const onDigit = (digit: string) =>
    setState((current) => inputDigit(current, digit));
  const onOperator = (operator: Operator) =>
    setState((current) => selectOperator(current, operator));
  const onPercent = () => setState((current) => percent(current));
  const onEquals = () => {
    const pre = state;
    const result = equals(pre);
    setState(result);
    reportEqualsCompletion(pre, result);
  };
  const onClearEntry = () => setState((current) => clearEntry(current));
  const onClearAll = () => setState(clearAll);
  const onBackspace = () => setState((current) => backspace(current));
  const onRestore = (restored: CalculatorState) => setState(restored);

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
        case "equals": {
          const pre = stateRef.current;
          const result = equals(pre);
          setState(result);
          reportEqualsCompletion(pre, result);
          break;
        }
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
    onRestore,
  };
}
