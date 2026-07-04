## Viral Growth Features for SweatReel

Six additions focused on organic sharing and retention. All UI stays in the existing dark theme with current tokens (`#0A0A0F`, `#141420`, `#4361EE`, `#FF6B35`, `#06D6A0`, etc.).

### 1. Share My Week card (Plans screen)
- Add `Share My Week 📤` button top-right of the "My Week" header in `src/routes/plans.tsx`.
- New util `src/lib/share-card.ts` renders a 1080×1080 canvas: gradient bg, blue glow, logo, `[Name]'s Week 🔥`, 7 day rows (muscle-color left border for planned days, gray "Rest Day" otherwise), streak pill, CTA.
- Export as PNG blob → `navigator.share({ files })` on mobile, download `SweatReel-MyWeek.png` on desktop. 1s minimum loading state with spinner overlay.

### 2. Web push–style reminders
- New `src/lib/reminders.ts` + `<ReminderPrompt />` mounted in `AppShell`. Uses `localStorage` timer; after 3 min of session time on first login shows bottom banner.
- On enable: `Notification.requestPermission()`, then persist `notifications_enabled` + `reminder_time` on `profiles`.
- Profile screen Notifications row becomes real: toggle + time dropdown (6 AM–10 PM). Values saved to Supabase.
- In-app `setInterval` (1 min) fires `new Notification("Time to sweat! 💪", { body, icon: "/icon-192.png" })` when local time matches. No service worker.

### 3. Share Streak card (Progress screen)
- `Share Streak 🔥` button under streak number in `src/routes/progress.tsx`.
- Reuse share util for a 1080×1920 stories card (fire glow, big 🔥, streak number, tagline, SweatReel wordmark). Same share/download path as Feature 1.

### 4. Achievements (Progress screen)
- New `src/lib/achievements.ts` with 6 definitions and evaluator against profile/workouts/plans/AI counters.
- Migration: add `unlocked_achievements jsonb default '[]'` and `ai_extractions_count int default 0` to `profiles`. Increment counter in `ai-extract.functions.ts`.
- 2×3 grid section on Progress below the heatmap. Locked = `#252535`; unlocked = per-achievement gradient; "30-Day Legend" gets shimmer animation.
- On app load (root effect), evaluate → if newly unlocked, persist to profile and trigger bottom slide-up toast (`linear-gradient(90deg,#7B2FBE,#4361EE)`), auto-dismiss 4s.

### 5. Referral link (Profile screen)
- New "Refer a Friend" section on `src/routes/profile.tsx`: heading, copy-link button, WhatsApp share button. Ref id = `user.id.slice(0,8)`.
- Migration: add `referred_by text` to `profiles`.
- Root route reads `?ref=` and stashes in `sessionStorage`; `handle_new_user` trigger stays as-is, plus a client-side one-shot after signup writes `referred_by` if unset and the stashed ref differs from own id.

### 6. Today's Workout widget (Home)
- In `src/routes/index.tsx`, when today has a planned workout, replace the current "Today's Plan" section with an expanded card: left column (TODAY label, title, muscle+difficulty tags, duration), right column (100×75 thumbnail), horizontal scroll of exercise pills if `exercises[]` present, orange full-width `Start Today's Workout 🔥` CTA that opens `ActiveWorkoutMode` directly for that workout.

### Technical notes
- Migration (single call): add `notifications_enabled boolean default false`, `reminder_time text`, `unlocked_achievements jsonb default '[]'`, `ai_extractions_count int default 0`, `referred_by text` to `public.profiles`. Existing RLS + grants already cover new columns.
- Share util is browser-only; guard `navigator.share` + `canShare({ files })` with a download fallback.
- Notifications and share buttons are suppressed while `ActiveWorkoutMode` is open (respects earlier "never during active workout" rule).
- Referral capture and reminders both key off `localStorage`/`sessionStorage` so nothing runs during SSR.
- No new dependencies.

### Files touched
- New: `src/lib/share-card.ts`, `src/lib/reminders.ts`, `src/lib/achievements.ts`, `src/components/fitvault/ReminderPrompt.tsx`, `src/components/fitvault/AchievementToast.tsx`, `src/components/fitvault/AchievementsGrid.tsx`, `src/components/fitvault/TodayWorkoutCard.tsx`.
- Edited: `src/routes/plans.tsx`, `src/routes/progress.tsx`, `src/routes/profile.tsx`, `src/routes/index.tsx`, `src/routes/__root.tsx` (ref capture + achievement toast host), `src/components/fitvault/AppShell.tsx` (reminder prompt mount), `src/lib/profile-store.ts` (new fields + setters), `src/lib/ai-extract.functions.ts` (increment counter).
- Migration for the 5 new `profiles` columns.
