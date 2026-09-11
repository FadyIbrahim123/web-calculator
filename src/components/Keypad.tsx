import type { Operator } from "../domain/calculator.types";
import CalcButton from "./CalcButton";
import "./Keypad.css";

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (operator: Operator) => void;
  onPercent: () => void;
  onEquals: () => void;
  onClearEntry: () => void;
  onClearAll: () => void;
  onBackspace: () => void;
}

export const OPERATOR_LABELS: Record<Operator, string> = {
  add: "+",
  subtract: "-",
  multiply: "×",
  divide: "÷",
};

function Keypad({
  onDigit,
  onOperator,
  onPercent,
  onEquals,
  onClearEntry,
  onClearAll,
  onBackspace,
}: KeypadProps) {
  return (
    <div className="keypad">
      <CalcButton variant="action" onClick={onClearAll} aria-label="Clear all">
        C
      </CalcButton>
      <CalcButton variant="action" onClick={onClearEntry} aria-label="Clear entry">
        CE
      </CalcButton>
      <CalcButton variant="action" onClick={onBackspace} aria-label="Delete last digit">
        &#9003;
      </CalcButton>
      <CalcButton variant="operator" onClick={onPercent} aria-label="Percent">
        %
      </CalcButton>

      <CalcButton onClick={() => onDigit("7")}>7</CalcButton>
      <CalcButton onClick={() => onDigit("8")}>8</CalcButton>
      <CalcButton onClick={() => onDigit("9")}>9</CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("divide")} aria-label="Divide">
        {OPERATOR_LABELS.divide}
      </CalcButton>

      <CalcButton onClick={() => onDigit("4")}>4</CalcButton>
      <CalcButton onClick={() => onDigit("5")}>5</CalcButton>
      <CalcButton onClick={() => onDigit("6")}>6</CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("multiply")} aria-label="Multiply">
        {OPERATOR_LABELS.multiply}
      </CalcButton>

      <CalcButton onClick={() => onDigit("1")}>1</CalcButton>
      <CalcButton onClick={() => onDigit("2")}>2</CalcButton>
      <CalcButton onClick={() => onDigit("3")}>3</CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("subtract")} aria-label="Subtract">
        {OPERATOR_LABELS.subtract}
      </CalcButton>

      <CalcButton wide onClick={() => onDigit("0")}>
        0
      </CalcButton>
      <CalcButton onClick={() => onDigit(".")} aria-label="Decimal point">
        .
      </CalcButton>
      <CalcButton variant="operator" onClick={() => onOperator("add")} aria-label="Add">
        {OPERATOR_LABELS.add}
      </CalcButton>

      <CalcButton
        variant="operator"
        className="keypad__equals"
        onClick={onEquals}
        aria-label="Equals"
      >
        =
      </CalcButton>
    </div>
  );
}

export default Keypad;
