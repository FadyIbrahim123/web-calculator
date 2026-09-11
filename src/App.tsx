import Display from "./components/Display";
import Keypad from "./components/Keypad";
import HistoryToggle from "./components/HistoryToggle";
import HistoryPanel from "./components/HistoryPanel";
import { useCalculator } from "./hooks/useCalculator";
import { useHistory } from "./hooks/useHistory";
import "./styles/tokens.css";
import "./App.css";

function App() {
  const history = useHistory();
  const {
    state,
    onDigit,
    onOperator,
    onPercent,
    onEquals,
    onClearEntry,
    onClearAll,
    onBackspace,
    onRestore,
  } = useCalculator(history.addFromCalculation);

  return (
    <div className="calculator">
      <HistoryToggle isOpen={history.isOpen} onToggle={history.toggle} />
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
      <HistoryPanel
        isOpen={history.isOpen}
        entries={history.entries}
        onSelect={(entry) => {
          onRestore(history.reuse(entry));
          history.close();
        }}
        onClear={history.clear}
      />
    </div>
  );
}

export default App;
