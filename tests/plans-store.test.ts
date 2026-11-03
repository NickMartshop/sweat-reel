import { describe, it, expect, vi } from "vitest";
import { plansStore } from "../src/lib/plans-store";
import { authStore } from "../src/lib/auth-store";

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

let mockIsAuthenticated = true;
const mockAuthUser = { id: "user-123" };

vi.mock("../src/lib/auth-store", () => ({
  authStore: {
    get: vi.fn(() => ({ user: mockIsAuthenticated ? mockAuthUser : null })),
    subscribe: vi.fn(() => () => {}),
  },
}));

describe("plansStore.addRest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    (authStore.get as any) = () => ({ user: mockAuthUser });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated user", async () => {
    mockIsAuthenticated = false;
    (authStore.get as any) = () => ({ user: null });
    await expect(plansStore.addRest(3, "active" as const)).rejects.toThrow("Not signed in");
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("rejects invalid rest type", async () => {
    await expect(plansStore.addRest(3, "invalid" as any)).rejects.toThrow("Invalid rest day");
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("rejects day below 0", async () => {
    await expect(plansStore.addRest(-1, "active" as const)).rejects.toThrow("Invalid rest day");
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("rejects day above 6", async () => {
    await expect(plansStore.addRest(7, "active" as const)).rejects.toThrow("Invalid rest day");
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("accepts all four valid rest types", async () => {
    for (const type of ["active", "full", "ice", "cardio"] as const) {
      vi.clearAllMocks();
      (authStore.get as any) = () => ({ user: mockAuthUser });
      await expect(plansStore.addRest(3, type)).resolves.not.toThrow();
      expect(mockSupabase.from).toHaveBeenCalledWith("weekly_plans");
      expect(mockSupabase.insert).toHaveBeenCalledTimes(1);
      const insertArgs = (mockSupabase.insert as any).mock.calls[0];
      expect(insertArgs[0].rest_type).toBe(type);
      expect(insertArgs[0].user_id).toBe("user-123");
    }
  });

  it("passes correct authenticated user ID in insert", async () => {
    vi.clearAllMocks();
    (authStore.get as any) = () => ({ user: { id: "user-456" } });
    await plansStore.addRest(3, "full" as const);
    const insertArgs = (mockSupabase.insert as any).mock.calls[0];
    expect(insertArgs[0].user_id).toBe("user-456");
  });

  it("propagates database errors", async () => {
    vi.clearAllMocks();
    (authStore.get as any) = () => ({ user: mockAuthUser });
    (mockSupabase.insert as any) = () => {
      const err = new Error("db error");
      err.status = 500;
      throw err;
    };
    await expect(plansStore.addRest(3, "active" as const)).rejects.toThrow("db error");
  });
describe("plansStore.remove", () => {
  const mockPlanId = "plan-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    (authStore.get as any) = () => ({ user: mockAuthUser });
    Object.defineProperty(plansStore, "state", {
      value: { entries: [{ id: mockPlanId, day_of_week: 3, rest_type: "full" }] },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthenticated user", async () => {
    mockIsAuthenticated = false;
    (authStore.get as any) = () => ({ user: null });
    await expect(plansStore.remove(mockPlanId)).rejects.toThrow("Not signed in");
    expect(mockSupabase.delete).not.toHaveBeenCalled();
  });

  it("deletes the plan with correct user ID filter applied", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [{ id: mockPlanId }],
              error: null,
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ data: [{ id: mockPlanId }], error: null }));

    await plansStore.remove(mockPlanId);

    const deleteChain = (mockSupabase.delete as any).mock.calls[0][0];
    expect(deleteChain.user_id).toBe("user-123");
  });

  it("applies both ID and user ID filters", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [{ id: mockPlanId }],
              error: null,
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ data: [{ id: mockPlanId }], error: null }));

    await plansStore.remove(mockPlanId);

    const eqCalls = (mockSupabase.eq as any).mock.calls;
    expect(eqCalls.some((c: any) => c[0] === "id")).toBe(true);
    expect(eqCalls.some((c: any) => c[0] === "user_id")).toBe(true);
  });

  it("confirms deletion with .select('id')", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [{ id: mockPlanId }],
              error: null,
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ data: [{ id: mockPlanId }], error: null }));

    await plansStore.remove(mockPlanId);

    expect((mockSupabase.select as any).mock.calls.some((c: any) => c[0] === "id")).toBe(true);
  });

  it("updates local state after successful deletion", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [{ id: mockPlanId }],
              error: null,
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ data: [{ id: mockPlanId }], error: null }));

    await plansStore.remove(mockPlanId);

    expect(plansStore.get().entries).toHaveLength(0);
  });

  it("rejects zero deleted rows", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ data: [], error: null }));

    await expect(plansStore.remove(mockPlanId)).rejects.toThrow("Plan not found");
  });

  it("propagates Supabase errors", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [],
              error: new Error("supabase delete failed"),
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ error: new Error("supabase delete failed") }));

    await expect(plansStore.remove(mockPlanId)).rejects.toThrow("supabase delete failed");
  });

  it("does not remove local state on failed deletion", async () => {
    (mockSupabase.delete as any)
      .mockReturnValueOnce({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [],
              error: new Error("supabase delete failed"),
            })),
          })),
        })),
      })
      .mockImplementationOnce(() => ({ error: new Error("supabase delete failed") }));

    await expect(plansStore.remove(mockPlanId)).rejects.toThrow();

    const state = plansStore.get();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].id).toBe(mockPlanId);
  });
});

});
