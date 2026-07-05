import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_workout",
  title: "Add workout",
  description: "Add a new workout to the signed-in user's SweatReel library.",
  inputSchema: {
    title: z.string().min(1).max(300),
    muscle_group: z.string().default("Full Body"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    duration_mins: z.number().int().min(1).max(360).default(30),
    url: z.string().url().optional(),
    thumbnail_url: z.string().url().optional(),
    platform: z.string().optional(),
    exercises: z
      .array(
        z.object({
          name: z.string().min(1),
          sets: z.number().int().min(1).max(20),
          reps: z.number().int().min(1).max(500),
          note: z.string().optional(),
        }),
      )
      .optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const exercises = (input.exercises ?? []).map((e) => ({
      id: crypto.randomUUID(),
      ...e,
    }));
    const { data, error } = await supabaseForUser(ctx)
      .from("workouts")
      .insert({
        user_id: ctx.getUserId(),
        title: input.title,
        muscle_group: input.muscle_group,
        difficulty: input.difficulty,
        duration_mins: input.duration_mins,
        url: input.url ?? null,
        thumbnail_url: input.thumbnail_url ?? null,
        platform: input.platform ?? null,
        exercises,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Added workout "${data.title}" (${data.id})` }],
      structuredContent: { workout: data },
    };
  },
});
