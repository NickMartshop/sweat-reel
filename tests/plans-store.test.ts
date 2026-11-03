import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { plansStore } from "../src/lib/plans-store"
import { authStore } from "../src/lib/auth-store"
import { supabase } from "@/integrations/supabase/client"

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe("Plans Store", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(plansStore as any).get = () => ({
      loading: false,
      entries: [],
      error: null,
    })
    ;(authStore as any).get = () => ({ user: null })
  })

  describe("addRest()", () => {
    it("should add rest with valid types", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({
        loading: false,
        entries: [],
        error: null,
      })
      vi.mocked(supabase.from).mockResolvedValueOnce({ data: {}, error: null })
      await plansStore.addRest(1, "active")
      expect(supabase.from).toHaveBeenCalledWith("weekly_plans")
    })

    it("should reject invalid rest type", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      await expect(plansStore.addRest(1, "invalid")).rejects.toThrow("Invalid rest day")
    })

    it("should reject invalid day", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      await expect(plansStore.addRest(7, "full")).rejects.toThrow("Invalid plan day")
      await expect(plansStore.addRest(-1, "full")).rejects.toThrow("Invalid plan day")
    })

    it("should throw error when unauthenticated", async () => {
      ;(authStore as any).get = () => ({ user: null })
      await expect(plansStore.addRest(1, "full")).rejects.toThrow("Not signed in")
    })

    it("should propagate database error", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ error: { message: "DB error" } })
      await expect(plansStore.addRest(1, "ice")).rejects.toThrow("DB error")
    }
describe("remove()", () => {
    it("should throw error when unauthenticated", async () => {
      ;(authStore as any).get = () => ({ user: null })
      await expect(plansStore.remove("some-id")).rejects.toThrow("Not signed in")
    })

    it("should use correct plan ID filter", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ data: [{ id: "plan-1" }], error: null })
      await expect(plansStore.remove("plan-1")).rejects.not.toThrow()
      expect(supabase.from).toHaveBeenCalledWith("weekly_plans")
      const deleteCall = supabase.from.mock.calls[0][1]
      expect(deleteCall).toEqual(expect.objectContaining({
        id: "plan-1",
        user_id: "test-user",
      }))
    })

    it("should use correct authenticated user ID filter", async () => {
      ;(authStore as any).get = () => ({ user: { id: "user-123" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ data: [], error: null })
      await expect(plansStore.remove("plan-1")).rejects.not.toThrow()
      const deleteCall = supabase.from.mock.calls[0][1]
      expect(deleteCall.user_id).toBe("user-123")
    })

    it(".select(id) confirmation", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from)
        .mockResolvedValueOnce({ data: [{ id: "plan-1" }], error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      await expect(plansStore.remove("plan-1")).rejects.not.toThrow()
    })

    it("successful local state update", async () => {
      const mockEntry = { id: "plan-1", kind: "rest", day_of_week: 1, rest_type: "full" }
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [mockEntry], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ data: [{ id: "plan-1" }], error: null })
      await plansStore.remove("plan-1")
      const state = (plansStore as any).get()
      expect(state.entries).not.toContainEqual(mockEntry)
    })

    it("zero-row deletion", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ data: [], error: null })
      await expect(plansStore.remove("nonexistent")).rejects.toThrow("Plan not found")
    })

    it("database error propagation", async () => {
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ error: { message: "DB error" } })
      await expect(plansStore.remove("plan-1")).rejects.toThrow("DB error")
    })

    it("failed deletion preserves the actual store state", async () => {
      const mockEntry = { id: "plan-1", kind: "rest", day_of_week: 1, rest_type: "full" }
      ;(authStore as any).get = () => ({ user: { id: "test-user" } })
      ;(plansStore as any).get = () => ({ loading: false, entries: [mockEntry], error: null })
      vi.mocked(supabase.from).mockResolvedValueOnce({ error: { message: "DB error" } })
      await expect(plansStore.remove("plan-1")).rejects.toThrow("DB error")
      const state = (plansStore as any).get()
      expect(state.entries).toContainEqual(mockEntry)
    })
  })
  ))