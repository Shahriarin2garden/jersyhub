# JersyHub — Design System

## Style Direction

**Vibrant & Block-based** — Bold, energetic, modern. Sports aesthetic without being garish.
Large sections (48px+ gaps), bold hover states, scroll-snap where appropriate.

## Color Palette

### Brand Colors

| Token              | Hex       | Usage                              |
|--------------------|-----------|------------------------------------|
| `primary`          | `#7C3AED` | Buttons, links, active states      |
| `primary-light`    | `#EDE9FE` | Hover backgrounds, badges          |
| `primary-dark`     | `#4C1D95` | Headings, primary text             |
| `secondary`        | `#A78BFA` | Hover states, secondary badges     |
| `accent`           | `#16A34A` | Add to cart, success, CTA buttons  |
| `accent-light`     | `#DCFCE7` | Success backgrounds                |
| `destructive`      | `#DC2626` | Errors, delete, decline, cancel    |
| `destructive-light`| `#FEF2F2` | Error backgrounds                  |

### Surface Colors

| Token         | Light Mode | Dark Mode  | Usage                  |
|---------------|-----------|------------|------------------------|
| `background`  | `#FAF5FF` | `#0f0a1a`  | Page background        |
| `card`        | `#FFFFFF` | `#1a1330`  | Cards, modals          |
| `muted`       | `#ECEEF9` | `#241c3a`  | Disabled, secondary bg |
| `foreground`  | `#4C1D95` | `#E8E4F0`  | Headings, primary text |
| `text-secondary`| `#5a5270`| `#B0A8C4` | Body text              |
| `text-muted`  | `#8a839c` | `#7A7290`  | Captions, hints        |
| `border`      | `#DDD6FE` | `#3d2d6e`  | Borders, dividers      |

### Status Colors

| Status      | Background | Text/Border | Badge Text |
|-------------|-----------|-------------|------------|
| `pending`   | `#FAEEDA` | `#854F0B`   | Amber      |
| `confirmed` | `#E6F1FB` | `#185FA5`   | Blue       |
| `shipped`   | `#EDE9FE` | `#7C3AED`   | Purple     |
| `delivered` | `#DCFCE7` | `#16A34A`   | Green      |
| `cancelled` | `#FEF2F2` | `#DC2626`   | Red        |

## Typography

### Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&display=swap');
```

- **Headings**: Barlow Condensed (600-700 weight, uppercase for hero/section titles)
- **Body**: Barlow (400-500 weight)
- **Mono/Data**: System monospace (tabular-nums for prices, order numbers)

### Type Scale

| Level    | Size  | Weight | Font             | Usage                         |
|----------|-------|--------|------------------|-------------------------------|
| Hero     | 36px  | 700    | Barlow Condensed | Landing page headline         |
| H1       | 28px  | 600    | Barlow Condensed | Page titles                   |
| H2       | 20px  | 600    | Barlow Condensed | Section titles, card headings |
| H3       | 16px  | 600    | Barlow           | Sub-headings                  |
| Body     | 16px  | 400    | Barlow           | Descriptions, paragraphs      |
| Caption  | 14px  | 400    | Barlow           | Table cells, helper text      |
| Micro    | 12px  | 500    | Barlow           | Badges, tiny labels           |

### Rules

- Minimum body text: 16px (avoids iOS auto-zoom on inputs)
- Line height: 1.5-1.65 for body text
- Max line length: 65-75 characters
- Headings: `text-wrap: balance`
- Prices and numbers: `font-variant-numeric: tabular-nums`

## Spacing

### Scale (4px base)

| Token | Value | Usage                          |
|-------|-------|--------------------------------|
| `xs`  | 4px   | Icon gaps, tight spacing       |
| `sm`  | 8px   | Inline spacing, badge padding  |
| `md`  | 12px  | Input padding, small gaps      |
| `base`| 16px  | Card padding, component gaps   |
| `lg`  | 24px  | Section gaps, form field gaps   |
| `xl`  | 32px  | Section padding                |
| `2xl` | 48px  | Section separations            |
| `3xl` | 64px  | Page section breaks            |

### Border Radius

| Element   | Radius |
|-----------|--------|
| Buttons   | 8px    |
| Inputs    | 8px    |
| Cards     | 12px   |
| Badges    | 20px (pill) |
| Modals    | 16px   |
| Avatars   | 50% (circle) |

### Breakpoints

| Name | Width  | Target                |
|------|--------|-----------------------|
| `sm` | 375px  | Small phones          |
| `md` | 768px  | Tablets               |
| `lg` | 1024px | Laptops               |
| `xl` | 1440px | Desktops              |

## Components

### Button

| Variant     | Background    | Text      | Border     | Usage                |
|-------------|--------------|-----------|------------|----------------------|
| Primary     | `primary`    | white     | none       | Main actions         |
| Secondary   | `primary-light`| `primary`| none       | Secondary actions    |
| Outline     | transparent  | `primary` | `primary`  | Tertiary actions     |
| Ghost       | transparent  | `text-secondary`| none | Minimal actions      |
| Accent      | `accent`     | white     | none       | Add to cart, confirm |
| Destructive | `destructive`| white     | none       | Delete, decline      |

**States**: hover (darken 10%), active (darken 15%), disabled (opacity 0.5, cursor not-allowed), loading (spinner + disabled).

**Size**: minimum 44px height for touch targets. Full width on mobile for primary CTAs.

### Input

- Visible label always (never placeholder-only)
- Height: 44px minimum
- Error message below field in `destructive` color
- Helper text in `text-muted`
- Focus ring: 2px `primary` with offset
- Required fields: asterisk after label

### Card

- Background: `card`
- Border: 1px `border`
- Radius: 12px
- Padding: 16px
- Product cards: hover scale(1.02) + shadow, 200ms transition

### Badge (Order Status)

```
pending    → amber bg + amber text
confirmed  → blue bg + blue text
shipped    → purple bg + purple text
delivered  → green bg + green text
cancelled  → red bg + red text
```

Pill shape (border-radius: 20px), padding: 2px 10px, font-size: 12px, font-weight: 500.

### Toast

- Auto-dismiss: 4 seconds
- Position: bottom-right (desktop), bottom-center (mobile)
- Variants: success (green), error (red), info (blue)

### Modal

- Scrim: rgba(0,0,0,0.5)
- Card: max-width 480px, centered
- Confirm dialog for destructive actions (delete product, cancel order)

### Skeleton

- Shimmer animation for loading states
- Match exact layout of content being loaded
- Use for product grids, tables, detail pages

### Empty State

- Centered illustration/icon + message + action button
- Used for: empty cart, no search results, no orders

## Icons

Use **Lucide React** exclusively. Never use emoji as icons.

Common icons:
- Navigation: `Menu`, `X`, `ChevronDown`, `ArrowLeft`, `ArrowRight`
- Commerce: `ShoppingCart`, `Package`, `Truck`, `CreditCard`
- Actions: `Plus`, `Trash2`, `Edit`, `Search`, `Filter`
- Status: `Check`, `AlertCircle`, `Clock`, `Ban`
- Social: `Phone`, `Mail`, `MapPin`

Size: 16px inline, 20px in buttons, 24px standalone.

## Images

- Product images: 4:5 aspect ratio (400x500px recommended)
- Category images: 16:9 aspect ratio
- Hero banner: full-width, max-height 500px
- Use `next/image` with Cloudinary URLs
- Always set `alt` text
- Lazy load below-the-fold images
- Use WebP format via Cloudinary transforms

## Dark Mode

Support both light and dark via `prefers-color-scheme` media query and Tailwind `dark:` prefix.
Define all colors as CSS custom properties. Never hardcode hex values in components.

## Accessibility

- Contrast ratio: 4.5:1 minimum for body text
- Touch targets: 44x44px minimum
- Focus visible on all interactive elements
- `alt` text on all meaningful images
- `aria-label` on icon-only buttons
- Form inputs always have associated labels
- Error messages announced via `aria-live`
- Respect `prefers-reduced-motion`

## Animation

- Micro-interactions: 150-300ms
- Page transitions: none (keep simple for MVP)
- Hover effects: scale + shadow on cards, color shift on buttons
- Loading: skeleton shimmer
- Easing: `ease-out` for enter, `ease-in` for exit
