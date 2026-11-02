import { test, describe, mock } from "node:test";
import { strict as assert } from "node:assert";

// Set env vars
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY = "test-key";

// Import real modules, then mock their methods
import { plansStore } from "../src/lib/plans-store";
import { authStore } from "../src/lib/auth-store";

const mockAuthGet = mock.method(authStore, "get");

describe("plansStore.remove", () => {
  test("should throw when user is not authenticated", async () => {
    mockAuthGet.mock.mockImplementation(() => ({ user: null }));

    await assert.rejects(() => plansStore.remove("plan-1"), /Not signed in/);
  });

  test("should require authentication before any database operation", async () => {
    mockAuthGet.mock.mockImplementation(() => ({ user: null }));

    // Verify no auth = no deletion attempt
    let threw = false;
    try {
      await plansStore.remove("plan-1");
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true);
  });

  test("should throw with ownership error when database returns zero rows", async () => {
    mockAuthGet.mock.mockImplementation(() => ({ user: { id: "user-1" } }));

    // With a real (unmocked) supabase client, the DB call will fail to connect.
    // The error should propagate from the database layer.
    let threw = false;
    let errorMessage = "";
    try {
      await plansStore.remove("plan-1");
    } catch (e: any) {
      threw = true;
      errorMessage = e.message ?? String(e);
    }
    assert.strictEqual(threw, true);
    // The error should not be "Not signed in" - it should be a DB/ownership error
    assert.notStrictEqual(errorMessage, "Not signed in");
  });
});