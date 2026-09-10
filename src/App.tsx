import Display from "./components/Display";
import Keypad from "./components/Keypad";
import { useCalculator } from "./hooks/useCalculator";
import "./styles/tokens.css";
import "./App.css";

function App() {
  const { state, onDigit, onOperator, onPercent, onEquals, onClearEntry, onClearAll, onBackspace } =
    useCalculator();

  return (
    <div className="calculator">
      <Display value={state.display} />
      <Keypad
        onDigit={onDigit}
        onOperator={onOperator}
        onPercent={onPercent}
        onEquals={onEquals}
        onClearEntry={onClearEntry}
        onClearAll={onClearAll}
        onBackspace={onBackspace}
      />
    </div>
  );
}

export default App;
