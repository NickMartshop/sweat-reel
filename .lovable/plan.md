## Fix 1 — Canonical duplication

There is no `index.html` in this TanStack Start project. The duplicate canonical comes from `src/routes/__root.tsx`, which sets a sitewide `<link rel="canonical" href="https://sweat-reel.lovable.app">`. TanStack Router concatenates `links` without dedup, so every leaf route emits both the root canonical and its own leaf canonical.

- Remove the canonical link from `src/routes/__root.tsx` (line 176).
- Leave all leaf canonicals as-is (`/`, `/privacy`, `/terms`, `/delete-account`, `/gear`, `/plans`, `/profile`, `/progress`, `/auth`) — each already emits exactly one self-referencing canonical.

Note: keeping current domain `sweat-reel.lovable.app` since domain changes are out of scope.

## Fix 2 — Accessible names on unlabeled inputs / icon-only controls

Add `aria-label` to interactive elements that currently have no accessible name:

**`src/routes/index.tsx`**
- Search input (line 268): add `aria-label="Search your workouts"`.

**`src/components/fitvault/AddWorkoutSheet.tsx`**
- Duration number input (line 452): `aria-label="Duration in minutes"`.
- Duration steppers (lines 448, 463): change generic `"Decrease"`/`"Increase"` to `"Decrease duration"`/`"Increase duration"`.
- Per-exercise name input (line 520): `aria-label="Exercise name"`.
- Per-exercise sets input (line 533): `aria-label="Sets"`.
- Per-exercise reps input (line 546): `aria-label="Reps"`.
- AI Extract button (line 476): `aria-label="Extract exercises with AI"`.
- Per-exercise delete button (line 559): change `"Delete"` to `"Remove exercise"`.

**`src/components/fitvault/BodyStatsSection.tsx`**
- Weight input (line 160): `aria-label="Weight in kilograms"`.
- Body-fat input (line 183): `aria-label="Body fat percentage"`.
- Notes input: `aria-label="Notes"`.
- Weight steppers: change `"Decrease"`/`"Increase"` to `"Decrease weight"`/`"Increase weight"`.

**Audit sweep** for any remaining icon-only `<button>` (X close, three-dot menu, sparkle) across `src/components/fitvault/*` and `src/routes/*` that lacks `aria-label`; add a descriptive one. Skip anything already labeled.

No other changes.