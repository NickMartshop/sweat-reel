import { describe, it, expect, beforeEach } from "vitest";
import { plansStore } from "../src/lib/plans-store";

describe("plansStore.get", () => {
  it("returns initial state", () => {
    const state = plansStore.get();
    expect(state.entries).toEqual([]);
  });
});

describe("plansStore.subscribe", () => {
  it("returns unsubscribe function", () => {
    const unsubscribe = plansStore.subscribe(() => {});
    expect(typeof unsubscribe).toBe("function");
  });
});
