## Add 3 production features (additive only)

### 1. Rating prompt after 5th workout
- New `src/components/fitvault/RatingPrompt.tsx` — full-screen dark overlay, card `#141420` / border `#252535`, 5 gold stars (`#FFD166`), press-scale on tap.
  - 4–5 stars → "Rate on Play Store ⭐" opens `https://play.google.com/store/apps/details?id=com.sweatreel.app`
  - 1–3 stars → textarea + "Send Feedback →" opens `mailto:support@sweatreel.com`
  - "Maybe later" closes without permanent flag but increments `sweatreel_rating_count`; on 3rd time sets permanent flag
  - `×` sets permanent flag
- New tiny store `src/lib/rating-store.ts` — exposes `maybeShowRating()` and a subscribable `visible` state. Reads/writes `sweatreel_rating_asked` and `sweatreel_rating_count` in `localStorage`.
- Trigger point: `ActiveWorkoutMode.tsx` completion handler ("Log This Workout ✓"). After the existing celebration, run the Supabase count query; if `count === 5` and flag not set, wait 2s then call `ratingStore.show()`. Never fires while `ActiveWorkoutMode` is still active — we schedule after the sheet closes.
- Host `<RatingPrompt />` inside `AppShell` next to other hosts, gated so it renders only when not in active workout mode (checked via existing active-workout signal / a simple `isActiveWorkout` flag on the store).
- Session behavior: on app open, if flag not set and previously dismissed, `maybeShowRating()` may re-show once per session.

### 2. Error boundary
- New `src/components/ErrorBoundary.tsx` — class component matching the spec (emoji, "Something went wrong", "Back to My Library" → `/`, "Reload App" → `location.reload()`, dev-only error text). Uses existing design tokens/hex from the spec.
- Wrap the outermost render in `src/routes/__root.tsx` `RootComponent` so it wraps `<QueryClientProvider>` + `<Outlet />`. TanStack's route-level `errorComponent` stays untouched; this catches React render errors inside the tree.

### 3. Offline detection banner
- New `src/components/fitvault/OfflineBanner.tsx` — uses `navigator.onLine` + `online`/`offline` listeners. Fixed top banner `#EF476F`, 12px white text: "⚠️ No internet connection — some features may not work". On reconnect, hides and calls existing `toast.success('Back online ✅')`.
- Mount in `AppShell` at the very top level (outside the auth/onboarding branches) so it shows on auth screen too. Add dynamic `paddingTop: isOnline ? 0 : 40` to the outer wrapper of each branch (Onboarding, AuthScreen container, and the main app container) to push content down without overlaying.

### Notes / skipped work
- `body_stats` table already exists with RLS + policy — SQL block is not needed; will not add the comment since the table is live.
- No changes to existing colors, layouts, stores, or flows.
- The 3 features are independent files; a failure in one does not affect the others.

### Technical details
- Rating trigger uses the current `supabase` client and `authStore.get().user.id`; count query is `head:true, count:'exact'`.
- Rating store guards against SSR (`typeof window` checks) before touching `localStorage`.
- ErrorBoundary placed inside `RootComponent` (not `RootShell`) so `<html>/<body>` still render if it trips.
- OfflineBanner uses `useSyncExternalStore` or `useEffect` with SSR-safe initial state (`typeof navigator !== 'undefined' ? navigator.onLine : true`).
