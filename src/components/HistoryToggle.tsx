import "./HistoryToggle.css";

export interface HistoryToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

function HistoryToggle({ isOpen, onToggle }: HistoryToggleProps) {
  return (
    <button
      type="button"
      className="history-toggle"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      {isOpen ? "Hide history" : "Show history"}
    </button>
  );
}

export default HistoryToggle;
