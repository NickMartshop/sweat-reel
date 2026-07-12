## Rebuild `/gear` into a full marketplace

### Files to change

1. **`src/lib/gear-catalog.ts`** — replace the 6-product array with the full 18-product list. Extend `GearProduct` with:
   - `mrp: string`
   - `imageUrl: string` (may be `""`)
   - `badge: string` (discount, e.g. `"50% OFF"`)
   
   Extend `GearCategory` union to add `"Cardio"`. Update `GEAR_CATEGORIES` list to: All, Resistance, Weights, Protein, Yoga, Accessories, Cardio, Recovery (in that order, with emojis per spec).

2. **`src/routes/gear.tsx`** — rebuild the page:
   - **Header row**: left `🛒 Gear Store` (20/700 white); right static cart badge showing `0` (non-functional, purely visual, `aria-label="Cart"`).
   - Keep existing amber affiliate-disclosure block unchanged.
   - **Search bar** (new): controlled input, `aria-label="Search gear"`, placeholder `"Search gear..."`, styled to match Home search (same dark pill, search icon left, clear ✕ button when text present).
   - **Category pills**: same horizontal scroller, updated categories incl. Cardio.
   - **Product count line**: `Showing {n} products` (12px, `#8888AA`).
   - **Filtering**: products filtered by category AND case-insensitive name match on search.
   - **`ProductImage` subcomponent** exactly per spec: local `useState` for `imgFailed`; renders emoji gradient block (160px) when `imageUrl` empty/failed, else `<img>` with `onError`, `object-fit: contain`, `#1A1A2E` bg, 8px padding, 160px height. Always passes real `alt={product.name}`.
   - **Product card redesign** per spec:
     - 160px image area via `ProductImage`
     - Top-right: existing `tag` pill (white bg, tagColor text)
     - Top-left: `badge` discount pill (`#EF476F` bg, white text, radius `0 0 8px 0`)
     - Info block: name (14/600, 2-line clamp), subtitle (11px muted, 1-line ellipsis), price row with strikethrough MRP + sale price side-by-side, rating row (⭐ rating + `(reviews reviews)`), Amazon button (unchanged style, 38px, `#FF9900` on `#000`).
   - **Empty state**: keep current "No {category} gear" but also handle search-only misses ("No results for '{query}'").
   - **Bottom CTA section** (new): 1px `#252535` divider, centered `"Want a specific product?"` (14/white), outlined button (`#FF9900` border + text, 44px, full width, `aria-label="Search Amazon India"`) opening `https://www.amazon.in/s?k=fitness+equipment&tag=nickinfotech-21` via existing `window.open` pattern with toast.
   - Update the JSON-LD `productItems` to reflect all 18 products (already dynamic — will scale automatically since it maps `GEAR_PRODUCTS`).
   - Keep the `head()` metadata otherwise unchanged.

### Out of scope
- No real Amazon image URLs added — every `imageUrl` stays `""`, comment block in the catalog file explains how to fill them in later.
- Cart badge is display-only (no cart logic).
- No changes to any other routes, monetization, or auth code.
- No design-token changes; keep inline color hex values consistent with the existing gear file.
