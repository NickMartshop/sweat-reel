import { describe, it, expect } from "vitest"
import { plansStore } from "../src/lib/plans-store"

describe("Plans Store Basic", () => {
  it("test1", () => {
    const ps = plansStore.get()
    expect(ps).toBeDefined()
  })
})