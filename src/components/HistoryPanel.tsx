import { OPERATOR_LABELS } from "./Keypad";
import type { HistoryEntry } from "../domain/history.types";
import "./HistoryPanel.css";

export interface HistoryPanelProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function HistoryPanel({ isOpen, entries, onSelect, onClear }: HistoryPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="history-panel" role="region" aria-label="Calculation history">
      {entries.length === 0 ? (
        <p className="history-panel__empty">No calculations yet.</p>
      ) : (
        <ul className="history-panel__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="history-panel__entry"
                onClick={() => onSelect(entry)}
              >
                {entry.firstOperand} {OPERATOR_LABELS[entry.operator]} {entry.secondOperand} ={" "}
                {entry.result}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="history-panel__clear"
        onClick={onClear}
      >
        Clear history
      </button>
    </div>
  );
}

export default HistoryPanel;
