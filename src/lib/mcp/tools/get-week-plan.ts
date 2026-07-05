import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

function weekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default defineTool({
  name: "get_week_plan",
  title: "Get week plan",
  description: "Get the signed-in user's planned workouts for a given week (defaults to current week). Returns workouts scheduled per day.",
  inputSchema: {
    week_start_date: z.string().optional().describe("Optional YYYY-MM-DD Monday date. Defaults to the current week."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ week_start_date }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const ws = week_start_date ?? weekStart(new Date());
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("weekly_plans")
      .select("day_of_week,workout_id,workouts(id,title,muscle_group,difficulty,duration_mins)")
      .eq("user_id", ctx.getUserId())
      .eq("week_start_date", ws)
      .order("day_of_week");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify({ week_start_date: ws, plan: data }) }],
      structuredContent: { week_start_date: ws, plan: data ?? [] },
    };
  },
});
