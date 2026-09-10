import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

function display() {
  return screen.getByRole("status", { name: "Calculator display" });
}

describe("App — basic calculation (User Story 1)", () => {
  it("computes 12 + 7 = 19 via on-screen buttons", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "7" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("19");
  });

  it("computes 9 - 15 = -6", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "9" }));
    await user.click(screen.getByRole("button", { name: "Subtract" }));
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("-6");
  });

  it("computes 6 × 7 = 42", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "Multiply" }));
    await user.click(screen.getByRole("button", { name: "7" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("42");
  });

  it("computes 20 ÷ 4 = 5", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Divide" }));
    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("5");
  });

  it("shows N/A for 5 ÷ 0 instead of crashing or showing Infinity", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Divide" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("N/A");
  });
});

describe("App — correcting mistakes (User Story 2)", () => {
  it("deletes the last digit with the delete-last-digit button", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "3" }));
    await user.click(screen.getByRole("button", { name: "Delete last digit" }));

    expect(display()).toHaveTextContent("12");
  });

  it("clear-entry resets only the current entry, preserving the pending operator", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Clear entry" }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    expect(display()).toHaveTextContent("50");
  });

  it("clear-all resets the whole calculation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Clear all" }));

    expect(display()).toHaveTextContent("0");
  });

  it("recovers from an error state by typing a new digit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "Divide" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));
    expect(display()).toHaveTextContent("N/A");

    await user.click(screen.getByRole("button", { name: "7" }));
    expect(display()).toHaveTextContent("7");
  });
});

describe("App — percentages (User Story 3)", () => {
  it("converts a standalone entry to a percentage", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Percent" }));

    expect(display()).toHaveTextContent("0.5");
  });

  it("computes 200 + 10% = 220", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Percent" }));
    expect(display()).toHaveTextContent("20");

    await user.click(screen.getByRole("button", { name: "Equals" }));
    expect(display()).toHaveTextContent("220");
  });
});

describe("App — keyboard operation (User Story 4)", () => {
  it("computes 12 + 7 = 19 using only the keyboard, ending with Enter", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("12+7{Enter}");

    expect(display()).toHaveTextContent("19");
  });

  it("computes 6 * 7 using the = key instead of Enter", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("6*7=");

    expect(display()).toHaveTextContent("42");
  });

  it("supports Backspace and Escape from the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("123{Backspace}");
    expect(display()).toHaveTextContent("12");

    await user.keyboard("{Escape}");
    expect(display()).toHaveTextContent("0");
  });

  it("ignores an unmapped key without crashing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("5q");

    expect(display()).toHaveTextContent("5");
  });
});
