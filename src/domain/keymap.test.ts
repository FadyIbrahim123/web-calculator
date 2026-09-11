import { describe, expect, it } from "vitest";
import { mapKeyToAction } from "./keymap";

describe("mapKeyToAction", () => {
  it.each(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])("maps digit key %s", (key) => {
    expect(mapKeyToAction(key)).toEqual({ type: "digit", digit: key });
  });

  it("maps . to a digit action", () => {
    expect(mapKeyToAction(".")).toEqual({ type: "digit", digit: "." });
  });

  it("maps + to add", () => {
    expect(mapKeyToAction("+")).toEqual({ type: "operator", operator: "add" });
  });

  it("maps - to subtract", () => {
    expect(mapKeyToAction("-")).toEqual({ type: "operator", operator: "subtract" });
  });

  it("maps * to multiply", () => {
    expect(mapKeyToAction("*")).toEqual({ type: "operator", operator: "multiply" });
  });

  it("maps / to divide", () => {
    expect(mapKeyToAction("/")).toEqual({ type: "operator", operator: "divide" });
  });

  it("maps % to percent", () => {
    expect(mapKeyToAction("%")).toEqual({ type: "percent" });
  });

  it("maps Enter to equals", () => {
    expect(mapKeyToAction("Enter")).toEqual({ type: "equals" });
  });

  it("maps = to equals", () => {
    expect(mapKeyToAction("=")).toEqual({ type: "equals" });
  });

  it("maps Backspace to backspace", () => {
    expect(mapKeyToAction("Backspace")).toEqual({ type: "backspace" });
  });

  it("maps Escape to clearAll", () => {
    expect(mapKeyToAction("Escape")).toEqual({ type: "clearAll" });
  });

  it("returns null for an unmapped key", () => {
    expect(mapKeyToAction("q")).toBeNull();
    expect(mapKeyToAction("Shift")).toBeNull();
    expect(mapKeyToAction("F5")).toBeNull();
  });
});
