import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { plansStore } from "../src/lib/plans-store";
import { authStore } from "../src/lib/auth-store";

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
describe("plansStore.addRest", () => {
  beforeEach(() => {
    ;(authStore.get = () => ({ user: { id: "user-123" } }))();
  });

  afterEach(() => {
    ;(authStore.get = (() => ({ user: undefined })) as any);
  });

  it("throws 'Not signed in' for unauthenticated user", async () => {
    ;(authStore.get = () => ({ user: undefined }))();
    let errorThrown = false;
    try {
      await plansStore.addRest(3, "active" as const);
    } catch (e) {
      errorThrown = e.message.includes("Not signed in");
    }
    expect(errorThrown).toBe(true);
  });

  it("throws 'Invalid rest day' for invalid rest type", async () => {
    let errorThrown = false;
    try {
      await plansStore.addRest(2, "invalid" as any);
    } catch (e) {
      errorThrown = e.message.includes("Invalid rest day");
    }
    expect(errorThrown).toBe(true);
  });

  it("throws 'Invalid rest day' for day below 0", async () => {
    let errorThrown = false;
    try {
      await plansStore.addRest(-1, "active" as const);
    } catch (e) {
      errorThrown = e.message.includes("Invalid rest day");
    }
    expect(errorThrown).toBe(true);
  });

  it("throws 'Invalid rest day' for day above 6", async () => {
    let errorThrown = false;
    try {
      await plansStore.addRest(7, "active" as const);
    } catch (e) {
      errorThrown = e.message.includes("Invalid rest day");
    }
    expect(errorThrown).toBe(true);
  });

  it("does not throw 'Invalid rest day' for valid types", async () => {
    const validTypes = ["active", "full", "ice", "cardio"];
    for (const type of validTypes) {
      let errorThrown = false;
      try {
        await plansStore.addRest(3, type as const);
      } catch (e) {
        errorThrown = e.message.includes("Invalid rest day");
      }
      expect(errorThrown).toBe(false);
    }
  });
});
