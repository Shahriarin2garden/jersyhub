# NexVive — Design System

> Brand: **NexVive** — *Style that defines you.* Wordmark is `NEX` in ink black
> + `VIVE` in gold, wide letter-spacing (`tracking-widest`), uppercase.

> Source of truth for visual decisions. Tokens live in `src/app/globals.css`
> (Tailwind v4, CSS-first — there is no `tailwind.config.ts`). This document
> explains the tokens and the rules for using them; when the two disagree, the
> CSS wins and this file should be corrected.

## Style Direction

**Refined & Block-based** — luxury fashion, not athletic loud. Black is the
canvas, gold is the single accent, warm cream is the light surface. Confirmed
against the ui-ux-pro-max engine for *luxury fashion e-commerce*: pattern
*Feature-Rich Showcase*, type *Cormorant + Montserrat*, palette *premium black +
gold*. The engine also floated a *Liquid Glass* style — rejected: its
backdrop-blur is flagged moderate-poor on performance and weak on text contrast,
wrong for a free-tier, mobile-first, bilingual store. We keep the performant
block-slab structure and express luxury through **type, restraint, and gold
accent** instead. The palette moved purple/green → black/gold to match the mark.

Characteristics:

- Large blocks of flat color; sections read as distinct slabs, not a gradient wash
- Black hero and dark slabs carry gold accents; light sections are warm cream
- Generous section rhythm (48–64px between sections, 80px+ on desktop)
- Bold type at large sizes, uppercase for headings; wide tracking on the wordmark
- High-contrast CTAs; exactly one primary CTA per viewport
- Gold is used **sparingly** — an accent, never a wash. Restraint reads as premium
- Motion is purposeful and small: 1–2 animated elements per view, 150–300ms

Anti-patterns for this style: gold on gold; gold used as body-text color on light
(fails contrast); more than two competing CTAs in one section; flat lifeless blocks.

## Color Palette

### Brand Colors

| Token              | Hex       | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `primary`          | `#171512` | Ink black — buttons, links, active, headings |
| `primary-light`    | `#F3ECDD` | Cream — hover backgrounds, badges        |
| `primary-dark`     | `#0C0B0A` | Near-pure black — hero, dark slabs, text on gold |
| `secondary`        | `#C9A24B` | Muted gold — secondary/hover accents     |
| `accent`           | `#C79A2E` | Gold — CTA/buy fills, promo slab (dark text on it) |
| `accent-dark`      | `#A87F1E` | Gold hover/active                        |
| `accent-light`     | `#F7EDD4` | Pale gold — badge/tint backgrounds (dark text) |
| `destructive`      | `#DC2626` | Errors, delete, decline, cancel          |
| `destructive-dark` | `#B91C1C` | Destructive hover/active                 |
| `destructive-light`| `#FEF2F2` | Error backgrounds                        |

**Gold contrast rule.** `accent` gold has ~2.6:1 on white — it **fails** as text
on light surfaces. Gold is a *fill*, not a text color: on `accent` / `accent-light`
put `primary-dark` (near-black) text; use gold text only on the black hero/slabs
or as a large brand mark (logos are contrast-exempt). Links and price emphasis on
light stay `primary` black bold, never gold.

### Surface Colors

| Token         | Light Mode | Dark Mode  | Usage                  |
|---------------|-----------|------------|------------------------|
| `background`  | `#FAF8F3` | `#0c0b0a`  | Page background        |
| `card`        | `#FFFFFF` | `#1a1712`  | Cards, modals          |
| `muted`       | `#F0EBE0` | `#23201a`  | Disabled, secondary bg |
| `foreground`  | `#171512` | `#F5EFE0`  | Headings, primary text |
| `text-secondary`| `#4a453c`| `#C9C2B2` | Body text              |
| `text-muted`  | `#8a8275` | `#8A8375`  | Captions, hints        |
| `border`      | `#E7E0D0` | `#332e24`  | Borders, dividers      |

Surface tokens swap automatically on `prefers-color-scheme`. Brand and status
colors are constant across themes.

### Status Colors

| Status      | Background | Text/Border | Badge Text |
|-------------|-----------|-------------|------------|
| `pending`   | `#FAEEDA` | `#854F0B`   | Amber      |
| `confirmed` | `#E6F1FB` | `#185FA5`   | Blue       |
| `shipped`   | `#F7EDD4` | `#8A6D12`   | Gold       |
| `delivered` | `#DCFCE7` | `#16A34A`   | Green      |
| `cancelled` | `#FEF2F2` | `#DC2626`   | Red        |

### Colors reserved for meaning

Some colors carry fixed meaning and must not be repurposed decoratively:

| Color            | Means                      | Where                                   |
|------------------|----------------------------|-----------------------------------------|
| `accent` (gold)  | Buy / CTA / brand emphasis | Order Now, Add to cart, promo slab, badges |
| Green `#16A34A`  | Success only (`--color-success`) | `delivered` badge, success toast — not a brand color |
| `destructive`    | Error, removal, discount % | `-20%` badge, delete, cancel            |
| `rating` `#E0A82E`| Star fills                | Shares the brand gold family by design  |

Rule: color alone never conveys state. Pair it with an icon or a word — a green
badge says "Delivered", a red one says "-20%". Green survives **only** as the
delivered/success signal; it is no longer a brand color, so never use it for CTAs
or decoration. Gold is now the buy/emphasis color.

### Using tokens

Always the token, never a raw hex, in a component:

```tsx
// Good
<div className="bg-primary text-white" />
<div className="border-border bg-card" />

// Bad
<div style={{ background: "#171512" }} />
<div className="bg-[#171512]" />
```

Arbitrary Tailwind values (`bg-[#…]`, `text-[13px]`) are a smell. If a value is
genuinely needed twice, it belongs in `globals.css` as a token first.

## Typography

### Font Stack

Loaded via `next/font/google` in `src/app/layout.tsx` (self-hosted, no render-
blocking request, `display: swap`):

**One minimal, premium sans across the whole UI** — headings, body, and wordmark
share the family; hierarchy comes from **weight and tracking**, not a second face.
A high-contrast serif (Cormorant) was tried and dropped: its thin strokes read
poorly at hero and card sizes. DM Sans stays crisp everywhere and reads clean-yet-
premium.

| Family        | CSS variable      | Script  | Role                                    |
|---------------|-------------------|---------|-----------------------------------------|
| DM Sans       | `--font-dmsans`   | Latin   | Everything — display, body, wordmark    |
| Hind Siliguri | `--font-hind`     | Bengali | Bengali counterpart, same sans voice    |

Both `--font-display` and `--font-body` = DM Sans → Hind Siliguri → system sans.
Headings carry `letter-spacing: -0.02em` (set globally on `h1–h4`) so the geometric
sans sets tightly and premium; the hero uses `font-bold tracking-tight`.

**Wordmark:** `font-body font-bold uppercase tracking-[0.2em]`, `NEX` in
`foreground` + `VIVE` in `accent`.

**Bangla is the default locale**, so its face is first-class, not a fallback. DM
Sans carries no Bengali glyphs, so Hind Siliguri sits next in the same stack — a
Latin run renders in DM Sans, a Bengali run in Hind Siliguri, within one line.

### Type Scale

| Level    | Size  | Weight | Font             | Usage                         |
|----------|-------|--------|------------------|-------------------------------|
| Display  | 48–72px| 700   | DM Sans | Landing hero — `tracking-tight`         |
| Hero     | 36px  | 700    | DM Sans | Section-leading headlines               |
| H1       | 28px  | 600    | DM Sans | Page titles                             |
| H2       | 20px  | 600    | DM Sans | Section titles, card headings           |
| H3       | 16px  | 600    | DM Sans | Sub-headings                            |
| Body     | 16px  | 400    | DM Sans | Descriptions, paragraphs                |
| Caption  | 14px  | 400    | DM Sans | Table cells, helper text                |
| Micro    | 12px  | 500    | DM Sans | Badges, eyebrow labels (`tracking-[0.15em]` uppercase) |

### Rules

- Minimum body text: 16px (avoids iOS auto-zoom on inputs)
- Line height: 1.5–1.65 for body text; 1.0–1.1 for display sizes
- Max line length: 65–75 characters desktop, 35–60 mobile
- Headings: `text-wrap: balance` (already applied globally to h1–h4)
- Prices, order numbers, counts: `.tabular` utility (`tabular-nums`) so digits
  do not reflow as values change
- Bangla runs longer than English for the same message. Any fixed-width element
  holding translated text must wrap rather than truncate — test both locales.

## Spacing

### Scale (4px base)

| Token | Value | Usage                          |
|-------|-------|--------------------------------|
| `xs`  | 4px   | Icon gaps, tight spacing       |
| `sm`  | 8px   | Inline spacing, badge padding  |
| `md`  | 12px  | Input padding, small gaps      |
| `base`| 16px  | Card padding, component gaps   |
| `lg`  | 24px  | Section gaps, form field gaps  |
| `xl`  | 32px  | Section padding                |
| `2xl` | 48px  | Section separations            |
| `3xl` | 64px  | Page section breaks            |

### Section Rhythm (landing and marketing surfaces)

| Context           | Mobile | Desktop | Tailwind            |
|-------------------|--------|---------|---------------------|
| Between sections  | 48px   | 80px    | `py-12 sm:py-20`    |
| Hero block        | 64px   | 112px   | `py-16 sm:py-28`    |
| Heading → content | 24px   | 24px    | `mb-6`              |
| Page gutter       | 16px   | 16px    | `px-4`              |
| Container         | —      | 1280px  | `max-w-7xl mx-auto` |

### Border Radius

| Element   | Radius | Token             |
|-----------|--------|-------------------|
| Buttons   | 8px    | `rounded-button`  |
| Inputs    | 8px    | `rounded-button`  |
| Cards     | 12px   | `rounded-card`    |
| Badges    | 20px   | `rounded-badge`   |
| Modals    | 16px   | `rounded-modal`   |
| Avatars   | 50%    | `rounded-full`    |

### Elevation

One shadow scale; do not invent intermediate values.

| Level | Tailwind     | Used for                                  |
|-------|--------------|-------------------------------------------|
| 0     | `shadow-none`| Flat blocks, section slabs                |
| 1     | `shadow-sm`  | Resting cards, sticky bars                |
| 2     | `shadow-lg`  | Card hover, popovers                      |
| 3     | `shadow-xl`  | Modals, drawers                           |

Blocks in a colored section stay flat — elevation reads as noise against a solid
slab. Elevate cards on `card`/`background` only.

### Breakpoints

| Name | Width  | Target                |
|------|--------|-----------------------|
| `sm` | 640px  | Large phones          |
| `md` | 768px  | Tablets               |
| `lg` | 1024px | Laptops               |
| `xl` | 1280px | Desktops              |

Design at **375px first**. 375 is the layout floor — nothing may scroll
horizontally there. Verify 375 / 768 / 1024 / 1440.

## Layout Patterns

### Landing Page — Feature-Rich Showcase

The pattern for an e-commerce home page. Section order, top to bottom:

1. **Hero** — value proposition, one primary CTA, one secondary. Trust chips
   inline. Visual on the right at `lg`, stacked below at mobile.
2. **Trust strip** — 4 concrete promises (COD, delivery window, authenticity,
   support). Icons plus text, never icons alone.
3. **Categories** — browse by sport. **Alternating solid-fill bento** (ink /
   cream / gold / ink), not photo tiles: big serif name, index number, gold
   rule, `ArrowUpRight`. Chosen because the catalog has no distinct category
   imagery — solid brand blocks read as intentional and never empty, where a
   repeated/absent photo reads as broken. Each tone ships its own contrast-safe
   text/arrow/line subclasses (`CATEGORY_TONES`).
4. **Featured products** — the commercial payload. 2 columns mobile, 4 desktop.
5. **Promo block** — coupon or offer, high-contrast slab.
6. **Social proof** — approved reviews with ratings. Placed *before* the final
   CTA, because proof converts a hesitant visitor immediately before the ask.
7. **Closing CTA** — repeats the hero action for anyone who scrolled the length.

Rules: one primary CTA per section; the same CTA verb throughout ("Shop now",
not "Shop now"/"Browse"/"See products" mixed); every section reachable and
readable without JS.

### Grids

| Content        | 375px | 768px | 1024px+ |
|----------------|-------|-------|---------|
| Product cards  | 2 col | 3 col | 4 col   |
| Category tiles | 2 col | 2 col | 4 col   |
| Trust items    | 2 col | 4 col | 4 col   |
| Review cards   | 1 col | 2 col | 3 col   |

Two columns of products at 375px beats one — it puts a second option on screen
without making either unreadable.

## Components

### Button

| Variant     | Background    | Text      | Border     | Usage                |
|-------------|--------------|-----------|------------|----------------------|
| Primary     | `primary`    | white     | none       | Main actions         |
| Secondary   | `primary-light`| `primary`| none       | Secondary actions    |
| Outline     | transparent  | `primary` | `primary`  | Tertiary actions     |
| Ghost       | transparent  | `text-secondary`| none | Minimal actions      |
| Accent      | `accent`     | `primary-dark` | none  | Buy, confirm (gold + ink text) |
| Destructive | `destructive`| white     | none       | Delete, decline      |

**States**: hover (darken 10%), press (`active:scale-[0.98]` tactile feedback,
150ms), disabled (opacity 0.5, `cursor-not-allowed`, no scale), loading (spinner
+ disabled). Base carries `tracking-wide` for a refined CTA feel.

**Size**: minimum 44px height. Full width on mobile for primary CTAs.

On a product: `Add to cart` is **Outline**, `Order Now` is **Accent**. Two equal
solid buttons side by side split attention; the outline/solid pairing makes the
faster path obvious while keeping both reachable.

### Input

- Visible label always (never placeholder-only)
- Height: 44px minimum
- Error message below the field in `destructive`
- Helper text in `text-muted`
- Focus ring: 2px `primary` with offset
- Required fields: asterisk after label
- Semantic `type`/`inputMode` so mobile shows the right keyboard (`tel` for
  phone, `numeric` for OTP)

### Card

- Background `card`, 1px `border`, `rounded-card`, 16px padding
- Product cards: lift on hover (`-translate-y-0.5` + `shadow-lg`, 200ms)
- Never nest a card inside a card — use a divider

### Product Card

Composition, top to bottom:

- Card border goes `accent/50` on hover (gold) + lifts `-translate-y-0.5` + `shadow-lg`
- Wishlist heart, absolute top-right, `bg-card/90`, 36px tap target
- Discount badge, absolute top-left, `destructive`, only when
  `compareAtPrice > price`
- Image, 4:5, `object-cover`, scales 1.03 on group hover
- Category eyebrow, 11px uppercase `tracking-[0.15em]`, `text-muted`
- Name, 2-line clamp, 16px **medium** (serif-era restraint), `group-hover:text-primary`
  — localized via `nameBn` when locale is `bn`
- Price row: `primary` bold, struck-through `compareAtPrice` beside it in
  `text-muted` when discounted

The heart sits *outside* the `<Link>` so tapping it never navigates.

### Badge (Order Status)

```
pending    → amber bg + amber text
confirmed  → blue bg + blue text
shipped    → gold bg + gold text
delivered  → green bg + green text
cancelled  → red bg + red text
```

Pill (`rounded-badge`), padding 2px 10px, 12px, weight 500.

### Star Rating

- Display: 5 stars, `rating` gold `#E0A82E` fill for earned, `muted` fill for the
  rest, average to one decimal plus review count beside them
- Input: 44px tap targets, hover preview, `role="radiogroup"` with labelled
  `radio` children
- Stars share the brand gold family — slightly brighter than `accent` so a filled
  star still reads on a gold button

### Toast

- Auto-dismiss 4s, `aria-live="polite"`, never steals focus
- Bottom-right desktop, bottom-center mobile
- success (green `--color-success`) / error (`destructive`) / info (`primary`) —
  each carries its own Lucide icon, so meaning never rides on colour alone

### Modal

- Scrim `rgba(0,0,0,0.5)` — strong enough to isolate the foreground
- Card max-width 480px, centered, `rounded-modal`
- Always a visible close affordance; confirm before destructive actions

### Skeleton

Shimmer (`.shimmer` in `globals.css`) matching the real layout's dimensions, for
anything that takes over 300ms. Reserve the same box the content will occupy.

### Empty State

Centered icon + message + action. Used for empty cart, no results, no orders,
empty wishlist. Always offers a way out — a button back to `/shop`.

## Icons

**Lucide React** exclusively. Never emoji as icons — they are font-dependent,
inconsistent across platforms, and cannot be themed by tokens.

- Navigation: `Menu`, `X`, `ChevronRight`, `ArrowRight`
- Commerce: `ShoppingCart`, `Package`, `Truck`, `Ticket`, `Zap`
- Account: `User`, `Heart`, `LogOut`, `ShieldCheck`
- Actions: `Plus`, `Trash2`, `Search`, `Check`
- Content: `Star`, `MessageCircle`, `Languages`

Sizes: `size-4` (16px) inline, `size-5` (20px) in buttons, `size-6`/`size-8`
standalone. One stroke width throughout — Lucide's default. Icon-only buttons
require `aria-label`.

## Images

- Product images 4:5 (400×500+); category 16:9; hero 3:2
- `next/image` always — with `fill` plus a sized parent, or explicit dimensions
- `sizes` on every `fill` image, or the browser downloads the desktop asset to a
  phone: `sizes="(max-width: 768px) 50vw, 25vw"` for a 4-up grid
- `priority` on the hero image only; everything below the fold lazy-loads
- Meaningful `alt`; `alt=""` for decorative art
- Repo assets live in `public/assets/` (see its README); merchant uploads go to
  Cloudinary with WebP transforms

## Motion

| Purpose            | Duration | Easing     |
|--------------------|----------|------------|
| Hover, color shift | 150ms    | `ease-out` |
| Card lift, scale   | 200ms    | `ease-out` |
| Section reveal     | 500ms    | `ease-out` |
| Exit               | ~60% of enter | `ease-in` |

Rules:

- Animate `transform` and `opacity` only — never `width`/`height`/`top`/`left`
- 1–2 animated elements per view; staggered list reveals step 40–60ms per item
- Motion must express cause and effect, never decorate
- `prefers-reduced-motion` is honoured globally in `globals.css` (durations
  collapse to 0.01ms). Any animation must therefore end at its *final* state, so
  content is fully visible when motion is off — never animate from `opacity: 0`
  without a matching end state of `opacity: 1`.

Two reveal mechanisms, chosen by fold position:

- **`.reveal` (CSS, `globals.css`)** — fade + rise **once on load**, `.reveal-delay-{1..6}`
  for stagger. Runs without JS and always animates *to* visible, so it is safe
  above the fold (**hero uses this**) — no blank first paint, no JS dependency.
- **`<Reveal>` (Motion, `components/ui/reveal.tsx`)** — scroll-triggered fade+rise
  (`whileInView`, `once`), for **below-the-fold** blocks (category tiles, product
  cards, review cards, closing). Honours `prefers-reduced-motion` (renders static).
  Motion emits `opacity:0` in SSR, so each element carries `data-reveal` and a
  `<noscript>` rule in the root layout forces `[data-reveal]` visible — every
  section stays readable with JS disabled.

**Haikei backdrop** (`components/ui/mesh-backdrop.tsx`): flat, organic gold blobs
that drift via transform-only CSS (`drift-a` / `drift-b`, 16–20s) — no filters, no
images, collapsed by the global reduced-motion rule. Used on the dark hero and
closing slabs in place of static circles.

## Accessibility

- Contrast 4.5:1 body text, 3:1 large text and meaningful glyphs — verified in
  **both** themes, not inferred from light mode
- Touch targets 44×44px minimum, 8px apart (stepper, size chips, icon buttons
  all sized to ≥44px)
- **Focus is global.** `globals.css` gives every `a`/`button`/`[role=button]`/
  `[tabindex]` a `:focus-visible` ring — a surface-gap + gold double-ring that
  stays visible on light cards, on the gold accent buttons themselves, and on
  black slabs, with a transparent `outline` fallback for Windows high-contrast.
  Custom controls inherit it automatically; never re-add a per-component ring
  (it double-draws). Inputs/selects keep their own field ring.
- **Cursor is global.** Tailwind v4 ships no default `cursor:pointer` on
  `<button>`; `globals.css` restores `pointer` on buttons/`[role=button]`/labels
  and `not-allowed` on `:disabled` / `[aria-disabled]`.
- `alt` on meaningful images, `aria-label` on icon-only buttons
- Labels on all inputs; errors beside the field and announced (`role="alert"`)
- Sequential heading order, one `h1` per page
- `prefers-reduced-motion` respected
- `<html lang>` follows the active locale (`bn`/`en`) so screen readers select
  the right voice — this is why the root layout reads the locale cookie

## Bilingual (BN / EN)

- Bangla is the default; English is opt-in via the navbar toggle
- Copy lives in `src/i18n/dictionaries.ts`, keyed `section.item`. Server
  components read it via `getT()`, client components via `useI18n()`
- Product and category names come from the database: `nameBn` / `descriptionBn`
  with fallback to the base field when empty (`localized()` in `src/i18n/server.ts`)
- Never concatenate translated fragments into a sentence — word order differs
  between the two languages. One key, one complete phrase
- Numbers and prices stay Western digits with the `৳` symbol in both locales
