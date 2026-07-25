# Static assets

Everything here is served from the site root: a file at
`public/assets/logos/logo.svg` is requested as `/assets/logos/logo.svg`.

Product photography that merchants upload at runtime goes to **Cloudinary**, not
here. This folder is for assets that ship with the repo — brand marks, the
landing hero, and category artwork.

## Layout

| Folder        | Holds                                    | Aspect / size            |
|---------------|------------------------------------------|--------------------------|
| `logos/`      | Brand marks, favicon source, wordmark     | SVG preferred, any size  |
| `hero/`       | Landing page hero imagery                 | 3:2, ≥1600px wide        |
| `categories/` | Sport/category tile artwork               | 16:9, ≥800px wide        |
| `products/`   | Sample & seed product photos              | 4:5, ≥800px wide         |

## Rules

- **SVG for logos and icons.** They scale, theme, and stay crisp. Never a PNG
  logo — see `docs/DESIGN.md`.
- **Reference by path, never import.** `<Image src="/assets/logos/logo.svg" …>`.
- **Always through `next/image`** with explicit `width`/`height` (or `fill` plus
  a sized parent), so the layout reserves space and CLS stays near zero.
- **Name in kebab-case, describe the content**: `barca-home-2026.jpg`, not
  `IMG_2841.jpg`.
- Keep raster files under ~300KB. Export WebP where the source allows it.
- Every image needs meaningful `alt` text at the call site. Decorative artwork
  takes `alt=""`.

## Brand logo

`logos/` is empty until the brand logo lands. Once it does:

1. Drop the SVG in as `logos/logo.svg` (full lockup) and `logos/mark.svg`
   (icon only, for the navbar at small widths).
2. Pull the palette out of it and reconcile with the tokens in
   `src/app/globals.css` — the tokens are the source of truth, so update them
   rather than hardcoding new colors at the call site.
3. Replace the `Shirt` Lucide icon currently standing in for the mark in
   `src/components/store/navbar.tsx` and the landing hero.
