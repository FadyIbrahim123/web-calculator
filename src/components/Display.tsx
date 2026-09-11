import "./Display.css";

interface DisplayProps {
  value: string;
}

function Display({ value }: DisplayProps) {
  const isLongMessage = value.length > 10;

  return (
    <div className="display" role="status" aria-live="polite" aria-label="Calculator display">
      <span className={`display__value${isLongMessage ? " display__value--message" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default Display;
