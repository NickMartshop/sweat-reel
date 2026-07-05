import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listWorkouts from "./tools/list-workouts";
import getProfile from "./tools/get-profile";
import getWeekPlan from "./tools/get-week-plan";
import addWorkout from "./tools/add-workout";
import scheduleWorkout from "./tools/schedule-workout";
import logCompletion from "./tools/log-completion";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "sweatreel-mcp",
  title: "SweatReel",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in SweatReel user's workout library, weekly plan, profile stats, and completion log. Use list_workouts and get_week_plan to see what the user has; add_workout, schedule_workout, and log_completed_workout to make changes.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listWorkouts, getProfile, getWeekPlan, addWorkout, scheduleWorkout, logCompletion],
});
