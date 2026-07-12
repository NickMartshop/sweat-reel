## SweatReel v1.0.1 — 3 Additive Improvements

### 1. Daily Motivational Quote (Home)
- Create `src/lib/daily-quote.ts` exporting the 30-quote array and a `getDailyQuote()` helper that picks one by day-of-year (`Math.floor((Date - startOfYear) / 86400000) % 30`).
- Create `src/components/fitvault/DailyQuoteCard.tsx` rendering the card with the specified styles (bg `#141420`, border `#252535`, radius 12, padding 12/16, 💡 icon, italic 13px white quote, 11px `#8888AA` author).
- Mount it in `src/routes/index.tsx` between the stats row and the Today's Plan section.

### 2. "This Month" Summary Card (Progress)
- Create `src/components/fitvault/MonthSummaryCard.tsx` that reads completed workouts (same source Progress screen already uses) and computes:
  - Workouts this month (count where date is in current month)
  - Active days this month (distinct YYYY-MM-DD)
  - Best week (max workouts in any rolling 7-day window across the month)
- Style: `linear-gradient(135deg,#1A0A2E,#0A0A1F)`, 1px `#4361EE` border, radius 16, padding 16, three stats side-by-side (24px/700 white value, 11px `#8888AA` label).
- Insert at the very top of `src/routes/progress.tsx` (above the existing h1/content).

### 3. "NEW" Badge on Gear Items
- In `src/lib/gear-catalog.ts` mark Jump Rope and Mini Massage Gun with `isNew: true`.
- In `src/routes/gear.tsx` product card, when `isNew`, render an absolute-positioned pill top-left: 10px/700, bg `#06D6A0`, color `#0A0A0F`, padding 3px 8px, border-radius `0 0 8px 0`, text "NEW".

### 4. Version Bump to 1.0.1
- Update `package.json` `"version"` to `"1.0.1"`.
- Update the version label shown on the Profile screen (`v1.0.0` → `v1.0.1`).

No existing functionality is changed — all four items are additive/visible edits only.
