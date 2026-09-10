import type { ButtonHTMLAttributes } from "react";
import "./CalcButton.css";

type Variant = "digit" | "operator" | "action" | "danger";

interface CalcButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Occupies two grid columns (used for the wide "0" button). */
  wide?: boolean;
}

function CalcButton({ variant = "digit", wide = false, className, ...rest }: CalcButtonProps) {
  const classes = ["calc-button", `calc-button--${variant}`, wide ? "calc-button--wide" : "", className]
    .filter(Boolean)
    .join(" ");

  return <button type="button" className={classes} {...rest} />;
}

export default CalcButton;
