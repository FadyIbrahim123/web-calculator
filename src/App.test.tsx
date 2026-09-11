import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

function display() {
  return screen.getByRole("status", { name: "Calculator display" });
}

async function openHistory(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Show history" }));
  return screen.getByRole("region", { name: "Calculation history" });
}

async function compute(
  user: ReturnType<typeof userEvent.setup>,
  keys: string,
) {
  await user.keyboard(keys);
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

describe("App — history: review recent calculations (History US1)", () => {
  it("shows an empty state on fresh load", async () => {
    const user = userEvent.setup();
    render(<App />);

    const region = await openHistory(user);

    expect(region).toHaveTextContent("No calculations yet.");
  });

  it("adds an entry after a completed calculation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);

    expect(
      within(region).getByRole("button", { name: "12 + 7 = 19" }),
    ).toBeInTheDocument();
  });

  it("lists a second calculation above the first (most-recent-first)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    // Clear-all before starting the next, unrelated calculation — round 1's
    // engine does not itself start a fresh entry on the next digit typed
    // right after a result (see the spawned follow-up task), so a real user
    // chaining independent calculations would clear first.
    await compute(user, "{Escape}6*7=");
    const region = await openHistory(user);

    const rows = within(region).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("6 × 7 = 42");
    expect(rows[1]).toHaveTextContent("12 + 7 = 19");
  });

  it("keeps only the 5 most recent entries, dropping the oldest", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "1+1=");
    await compute(user, "{Escape}2+2=");
    await compute(user, "{Escape}3+3=");
    await compute(user, "{Escape}4+4=");
    await compute(user, "{Escape}5+5=");
    await compute(user, "{Escape}6+6=");
    const region = await openHistory(user);

    const rows = within(region).getAllByRole("listitem");
    expect(rows).toHaveLength(5);
    expect(region).not.toHaveTextContent("1 + 1 = 2");
    expect(
      within(region).getByRole("button", { name: "6 + 6 = 12" }),
    ).toBeInTheDocument();
  });

  it("never adds an entry for a calculation that ends in an error", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "5/0=");
    expect(display()).toHaveTextContent("N/A");

    const region = await openHistory(user);
    expect(region).toHaveTextContent("No calculations yet.");
  });

  it("always starts with an empty history on a fresh instance (FR-009/SC-006)", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await compute(user, "12+7=");
    const populated = await openHistory(user);
    expect(
      within(populated).getByRole("button", { name: "12 + 7 = 19" }),
    ).toBeInTheDocument();
    unmount();

    // No persistence code exists anywhere in this feature (FR-009), so a
    // fresh instance — the closest jsdom proxy for "the page was reloaded"
    // — must never see the previous instance's entries.
    const freshUser = userEvent.setup();
    render(<App />);
    const region = await openHistory(freshUser);
    expect(region).toHaveTextContent("No calculations yet.");
  });
});

describe("App — history: reuse a past calculation (History US2)", () => {
  it("sets the display to a selected entry's result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "12 + 7 = 19" }));

    expect(display()).toHaveTextContent("19");
  });

  it("discards an in-progress calculation when a history entry is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    await compute(user, "{Escape}45+");
    expect(display()).toHaveTextContent("45");

    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "12 + 7 = 19" }));

    expect(display()).toHaveTextContent("19");
  });

  it("lets the user continue calculating from a reused result, and records the new result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "12 + 7 = 19" }));
    // Selecting an entry closes the panel (region unmounts); continue on
    // the calculator, then reopen history to check the new entry.
    await compute(user, "+3=");

    expect(display()).toHaveTextContent("22");
    const updatedRegion = await openHistory(user);
    expect(
      within(updatedRegion).getByRole("button", { name: "19 + 3 = 22" }),
    ).toBeInTheDocument();
  });

  it("closes the history panel after selecting an entry", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "12 + 7 = 19" }));

    expect(screen.queryByRole("region", { name: "Calculation history" })).not.toBeInTheDocument();
  });

  it("does not remove or reorder the history list when an entry is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    await compute(user, "{Escape}6*7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "12 + 7 = 19" }));

    // Selecting closes the panel; reopen it to inspect the list afterward.
    const reopened = await openHistory(user);
    const rows = within(reopened).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("6 × 7 = 42");
    expect(rows[1]).toHaveTextContent("12 + 7 = 19");
  });
});

describe("App — history: clear the list (History US3)", () => {
  it("shows the empty state immediately after clearing a populated list", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "Clear history" }));

    expect(region).toHaveTextContent("No calculations yet.");
  });

  it("shows a calculation completed right after clearing as the sole entry", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "Clear history" }));

    await compute(user, "{Escape}6*7=");
    expect(within(region).getAllByRole("listitem")).toHaveLength(1);
    expect(
      within(region).getByRole("button", { name: "6 × 7 = 42" }),
    ).toBeInTheDocument();
  });

  it("is a no-op when the list is already empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "Clear history" }));

    expect(region).toHaveTextContent("No calculations yet.");
  });

  it("leaves the active calculation untouched when history is cleared", async () => {
    const user = userEvent.setup();
    render(<App />);

    await compute(user, "12+7=");
    await compute(user, "{Escape}45+");
    expect(display()).toHaveTextContent("45");

    const region = await openHistory(user);
    await user.click(within(region).getByRole("button", { name: "Clear history" }));

    expect(display()).toHaveTextContent("45");
  });
});
