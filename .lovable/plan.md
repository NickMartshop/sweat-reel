# SweatReel: Affiliate + Production Polish

Six features. Everything backend-touching happens in one migration; UI ships after approval.

## 1. Database migration (single call)

New `body_stats` table, plus 3 new `profiles` columns.

```sql
-- profiles: goal + workout prefs
ALTER TABLE public.profiles
  ADD COLUMN fitness_goal text,
  ADD COLUMN default_difficulty text NOT NULL DEFAULT 'Medium',
  ADD COLUMN rest_timer_seconds integer NOT NULL DEFAULT 60,
  ADD COLUMN auto_advance_rest boolean NOT NULL DEFAULT false;

-- weekly_plans: rest day metadata (nullable; a "rest day" is a row with workout_id NULL)
ALTER TABLE public.weekly_plans ALTER COLUMN workout_id DROP NOT NULL;
ALTER TABLE public.weekly_plans ADD COLUMN rest_type text; -- 'active'|'full'|'ice'|'cardio'|null

-- body_stats
CREATE TABLE public.body_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric,
  body_fat_pct numeric,
  notes text,
  logged_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_stats TO authenticated;
GRANT ALL ON public.body_stats TO service_role;
ALTER TABLE public.body_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own body_stats all" ON public.body_stats
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX body_stats_user_logged_idx ON public.body_stats(user_id, logged_at DESC);
```

## 2. Gear tab (affiliate)

- `BottomNav.tsx`: 5 tabs (`grid-cols-5`), smaller icons (20px) and 10px labels. Order: Home, Plans, Progress, Profile, Gear (ShoppingBag).
- New route `src/routes/gear.tsx` with its own `head()` (title, description, og:*).
- New `src/lib/gear-catalog.ts` — hardcoded 6-item array + `REPLACE placeholder affiliate_url` comment.
- UI: header "Fitness Gear 🏋️" + "Affiliate store", disclosure subtext, horizontal category pills (All + 6), 2-column product card grid using `picsum.photos/seed/<slug>/400/400` thumbnails, star rating (4.5 default), price, "Buy on Amazon →" outlined button (#FF9900). Tap opens `affiliate_url` in new tab + toast "Opening Amazon… 🛍️".
- Sticky footer: "As an Amazon Associate, SweatReel earns from qualifying purchases."

## 3. Body Stats tracker (Progress)

- New `src/lib/body-stats-store.ts` — CRUD via authenticated Supabase client, mirroring `workouts-store`.
- New `src/components/fitvault/BodyStatsSection.tsx` above `AchievementsGrid`:
  - "My Progress" heading, "Log Today 📊" outlined-blue full-width button.
  - Bottom sheet with weight (stepper ±0.5kg), body-fat %, notes.
  - Inline SVG line chart of last 7 entries: 260×120 viewBox, #4361EE polyline, 8px dots with `<title>` tooltips, min/max Y-axis auto-scaled.
- Route `/progress` renders the section between the heatmap and Achievements.

## 4. Rest Day types (Plans)

- Add "Mark as Rest Day" button in the empty-day state and in the day header when no workouts scheduled.
- New `RestDayTypeSheet` bottom sheet: 4 options (Active Recovery 🧘, Full Rest 💤, Ice Bath 🧊, Light Cardio 🏃).
- On select: insert a `weekly_plans` row with `workout_id=null`, `rest_type=<key>`. Update `plans-store` types & fetcher (join now optional).
- Day cell shows emoji dot for rest days; day view shows a "Rest Day — <label>" card with remove button.
- If `active`: show tip card "💡 Try 20 min of light walking or foam rolling…".
- Share-week card: treat rest rows as "Rest Day" text (unchanged behavior).

## 5. Privacy + Terms

- Rewrite `src/routes/privacy.tsx` with 5 sections from the spec.
- New `src/routes/terms.tsx` with 5 bullet Terms.
- Both routes get full `head()` (title, description, og:*, canonical).
- Profile → Support section: add link row to `/terms` (already links `/privacy`).

## 6. Onboarding goal (screen 4) + personalized greeting

- Extend `Onboarding.tsx`: add 4th slide with 4 goal cards (build/lose/flex/general). Select → checkmark + border #4361EE. "Continue →" button on selection.
- Store: pass `goal` up to `AppShell`, persist via `profileStore.setFitnessGoal(goal)` (writes `profiles.fitness_goal`). Slide is skippable via existing Skip button (stores null).
- If user is unauthenticated when they finish, stash goal in `sessionStorage` and flush after signup (like referrals).
- `src/routes/index.tsx` greeting sub-text switches on `profile.fitness_goal`.

## 7. Settings expansion (Profile)

Add three new sections to `profile.tsx`:

- **Workout Preferences**: Default Difficulty segmented control (Easy/Medium/Hard), Rest Timer select (30/60/90/120s), Auto-advance toggle. All persisted via `profileStore`.
- **About SweatReel**: version row (v1.0.0), Terms link, Privacy link, Rate SweatReel (placeholder `#`), Share App (Web Share API with the specified copy).
- **Danger Zone**: red-outlined card with "Delete My Account" button → confirm dialog → MVP behavior: `signOut()` + toast "Account deletion requested — email support@sweatreel.com to complete." (Client-side `admin.deleteUser` is not possible; documented in code comment.)

## Files

**New:** `src/lib/gear-catalog.ts`, `src/lib/body-stats-store.ts`, `src/routes/gear.tsx`, `src/routes/terms.tsx`, `src/components/fitvault/BodyStatsSection.tsx`, `src/components/fitvault/RestDayTypeSheet.tsx`, `src/components/fitvault/DeleteAccountDialog.tsx`.

**Edited:** `BottomNav.tsx`, `Onboarding.tsx`, `AppShell.tsx`, `profile-store.ts`, `plans-store.ts`, `plans.tsx`, `progress.tsx`, `profile.tsx`, `index.tsx`, `privacy.tsx`, `share-card.ts` (rest-day label), `integrations/supabase/types.ts` (auto-regenerated).

## Notes

- All Supabase reads/writes go through the existing browser client with RLS; no server functions needed.
- No new dependencies (SVG chart inline).
- Delete-account cannot fully purge the user client-side without service role — MVP flow logs out and instructs email, per spec's fallback.
