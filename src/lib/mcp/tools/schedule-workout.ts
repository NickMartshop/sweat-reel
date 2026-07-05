import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

function currentWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default defineTool({
  name: "schedule_workout",
  title: "Schedule workout",
  description: "Schedule an existing workout on a specific day of the week for the signed-in user.",
  inputSchema: {
    workout_id: z.string().uuid(),
    day_of_week: z.number().int().min(0).max(6).describe("0=Monday .. 6=Sunday"),
    week_start_date: z.string().optional().describe("YYYY-MM-DD Monday date. Defaults to current week."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false },
  handler: async ({ workout_id, day_of_week, week_start_date }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const ws = week_start_date ?? currentWeekStart();
    const { data, error } = await supabaseForUser(ctx)
      .from("weekly_plans")
      .insert({
        user_id: ctx.getUserId(),
        workout_id,
        day_of_week,
        week_start_date: ws,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Scheduled workout on day ${day_of_week} of week ${ws}` }],
      structuredContent: { plan: data },
    };
  },
});
