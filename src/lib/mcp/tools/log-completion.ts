import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_completed_workout",
  title: "Log completed workout",
  description: "Log that the signed-in user completed a workout. Records duration and timestamp.",
  inputSchema: {
    workout_id: z.string().uuid().optional(),
    duration_mins: z.number().int().min(1).max(600),
  },
  annotations: { readOnlyHint: false, idempotentHint: false },
  handler: async ({ workout_id, duration_mins }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("completed_workouts")
      .insert({
        user_id: ctx.getUserId(),
        workout_id: workout_id ?? null,
        duration_mins,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${duration_mins} min workout` }],
      structuredContent: { completed: data },
    };
  },
});
