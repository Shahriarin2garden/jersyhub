# JersyHub — Page Specifications

Every page spec below is a complete brief for building that page.
Read `DESIGN.md` for visual tokens, `ARCHITECTURE.md` for data shapes.

---

## Customer Pages

### Landing Page — `/`

**Layout**: Full-width sections, stacked vertically.

**Sections:**
1. **Navbar** — Logo (left), "Shop" link (center-left), Cart icon with item count badge (right). Sticky on scroll. Height: 64px. White bg with bottom border.
2. **Hero** — Full-width. Background: gradient or jersey image. Headline: "Premium jerseys, local prices" (Barlow Condensed, 36px, uppercase). Subtext: one line. CTA button: "Shop now" (accent green, large). Max-height: 450px.
3. **Featured Products** — Heading: "Popular jerseys". 4-column grid (desktop), 2-column (mobile). Show 8 products max. Each: ProductCard component.
4. **Categories** — Heading: "Browse by sport". 4 cards in a row. Each: image bg + category name overlay + product count. Click → `/shop?category=slug`.
5. **Trust Strip** — 3 columns. Icons + text: "Authentic quality", "Cash on delivery", "WhatsApp support". Simple, no cards.
6. **Footer** — Business name, address, phone, WhatsApp link, social links. Dark bg.

**Data**: Fetch featured products + categories via Server Component.

---

### Product Catalog — `/shop`

**Layout**: Sidebar (desktop) + grid. Full-width grid on mobile with filter drawer.

**Filter sidebar** (left, 240px wide on desktop):
- Category: checkbox list
- Size: checkbox list (S/M/L/XL/XXL)
- Price range: min-max inputs
- "Apply" button (mobile drawer only)

**Sort bar** (above grid): Dropdown — "Newest", "Price: Low to High", "Price: High to Low"

**Product grid**: 3 columns desktop, 2 mobile. Paginated (12 per page).

**ProductCard**:
- Image (4:5 ratio, `next/image`)
- Product name (16px, 600 weight)
- Category badge (micro, muted)
- Price (18px, 700 weight, tabular-nums): `৳1,200`
- "Add to cart" button or "View" link
- Hover: scale(1.02) + shadow

**Empty state**: "No jerseys found" + "Clear filters" button.

**Data**: Server Component with searchParams for filters/sort/page.

---

### Product Detail — `/shop/[slug]`

**Layout**: Two columns on desktop (image left 55%, details right 45%). Single column mobile.

**Image section**:
- Main image (large, 4:5)
- Thumbnail strip below (horizontal scroll, 4-5 thumbs)
- Click thumb → swap main image

**Details section**:
- Breadcrumb: Home > Shop > [Category] > [Product Name]
- Product name (H1, 28px)
- Category + league badge
- Price (large, 24px, bold): `৳1,200`
- Size selector: toggle group (S/M/L/XL/XXL). Gray out unavailable sizes. Show stock count for selected size.
- Quantity: +/- stepper (min 1, max = stock)
- "Add to cart" button (accent, full width, 48px height)
- Description (body text, collapsible if long)

**Below fold**:
- Related products (same category, 4 cards, horizontal scroll on mobile)

**Data**: Server Component. Fetch product by slug with variants.

---

### Cart — `/cart`

**Layout**: List + sidebar summary. Single column on mobile.

**Cart items list**:
- Each item: thumbnail (64x80), name, size badge, unit price, quantity stepper, line total, remove (trash icon) button
- Divider between items

**Order summary sidebar** (sticky on desktop):
- Subtotal
- Delivery fee (flat rate or free above threshold)
- Total (bold, large)
- "Proceed to checkout" button (accent, full width)

**Empty state**: Cart icon + "Your cart is empty" + "Start shopping" link.

**Data**: Client component. Read from localStorage via useCart hook.

---

### Checkout — `/checkout`

**Layout**: Two columns desktop (form left 60%, summary right 40%). Single column mobile (summary collapsed at top).

**Form fields** (in order):
1. Full name — text, required
2. Phone — tel, required, validate BD format (01XXXXXXXXX)
3. Email — email, optional
4. Division — select dropdown, required
5. District — select dropdown, filtered by division, required
6. Full address — textarea, required, min 10 chars
7. Payment method — radio group: "bKash" / "Cash on delivery"
8. bKash transaction ID — text, shown only if bKash selected, with bKash number displayed
9. Order notes — textarea, optional

**Order summary** (right/top):
- Line items (compact: name, size, qty, price)
- Subtotal, delivery fee, total
- Edit cart link

**Submit**: "Place order" button (accent, full width). Loading state on submit. Disable double-click.

**On success**: Redirect to `/order/[orderNumber]`.

**Validation**: Client-side (Zod) + server-side.

---

### Order Tracking — `/order/[id]`

**Layout**: Centered card, max-width 600px.

**Content**:
- Order number: `JH-XXXXXX` (large, mono)
- Status timeline (vertical stepper):
  - Order placed ✓ (with date)
  - Confirmed ✓ or pending
  - Shipped ✓ or pending
  - Delivered ✓ or pending
  - Current step: highlighted with primary color
  - Cancelled: red, replaces remaining steps
- Order items table (compact)
- Delivery address
- WhatsApp link: "Questions? Contact us on WhatsApp"

**Data**: Server Component. Fetch by orderNumber (not internal ID).

---

## Admin Pages

### Admin Login — `/admin`

**Layout**: Centered card, max-width 400px, vertically centered.

**Content**:
- Logo
- "Admin login" heading
- Email input
- Password input (with show/hide toggle)
- "Sign in" button (primary, full width)
- Error message area

**Auth**: NextAuth signIn with credentials. Redirect to `/admin/dashboard` on success.

---

### Dashboard — `/admin/dashboard`

**Layout**: Admin layout (sidebar left, content right).

**Sidebar** (240px, collapsible):
- Logo at top
- Nav items: Dashboard, Orders, Products, Customers
- Active item highlighted
- Collapse to icons on tablet
- Hidden on mobile (hamburger menu)

**Content**:

1. **Stat cards row** (4 cards):
   - Total orders (all time)
   - Pending orders (needs attention — amber)
   - Delivered orders (green)
   - Total revenue (৳, green)

2. **Recent orders table** (last 10):
   - Columns: Order #, Customer, Items, Total, Status (badge), Date, Action (view link)
   - Click row → `/admin/orders/[id]`

3. **Quick stats** (optional for MVP):
   - Orders today count
   - Top selling product

**Data**: Server Component. Aggregate queries via Prisma.

---

### Order Management — `/admin/orders`

**Layout**: Admin layout.

**Toolbar**:
- Search input (by order # or customer name)
- Status filter: tabs or dropdown (All / Pending / Confirmed / Shipped / Delivered / Cancelled)
- Date range filter (optional for MVP)

**Orders table**:
- Columns: Order #, Customer name, Phone, Items count, Total (৳), Status (badge), Payment (badge), Date
- Sortable by date, total
- Paginated (20 per page)
- Click row → order detail

---

### Order Detail — `/admin/orders/[id]`

**Layout**: Admin layout. Two-column content.

**Left column (60%)**:
- Order items table: thumbnail, name, size, qty, unit price, total
- Order totals: subtotal, delivery, total

**Right column (40%)**:
- Customer info card: name, phone (clickable tel:), email, address
- Order status card:
  - Current status badge (large)
  - Status update dropdown + "Update" button
  - For PENDING: "Accept" (accent) + "Decline" (destructive) buttons
- Payment info: method, status, bKash txn ID if applicable
- Status history timeline (compact, timestamps)

---

### Product Management — `/admin/products`

**Layout**: Admin layout.

**Toolbar**:
- "Add product" button (primary)
- Search input
- Status filter: All / Published / Draft

**Products table/grid**:
- Toggle: table view / grid view
- Table columns: thumbnail, name, category, price, stock (total across sizes), status, actions (edit/delete)
- Grid: ProductCard with edit overlay on hover
- Paginated

---

### Add/Edit Product — `/admin/products/new` or `/admin/products/[id]`

**Layout**: Admin layout. Single column form, max-width 720px.

**Form**:
1. Product name — text, required
2. Description — textarea
3. Category — select dropdown, required
4. Price — number, required, min 0
5. Images — drag-drop upload zone. Multiple images. Preview with reorder (drag) and delete. Uploads to Cloudinary on drop.
6. Size variants — table:
   | Size | Stock | Actions |
   |------|-------|---------|
   | S    | [input] | remove |
   | M    | [input] | remove |
   - "Add size" button
7. Status — toggle: Draft / Published
8. Featured — toggle: Yes / No

**Actions**: "Save" (primary), "Cancel" (ghost). "Delete" (destructive, with confirm modal) on edit page only.

---

### Customer Management — `/admin/customers`

**Layout**: Admin layout.

**Content**:
- Search by name or phone
- Table columns: Name, Phone, Email, Total orders, Total spent (৳), Last order date
- Click row → customer detail (expandable or modal showing all orders by this customer)
- Paginated (20 per page)
- Sort by total orders, total spent, last order date

---

## Shared Components Checklist

Build these first before any page:

- [ ] `Button` — all variants (primary, secondary, outline, ghost, accent, destructive)
- [ ] `Input` — text, tel, email, number, with label, error, helper text
- [ ] `Select` — dropdown with label
- [ ] `Textarea` — with label
- [ ] `Card` — base card with padding + border
- [ ] `Badge` — status badges with color mapping
- [ ] `Modal` — confirm dialog
- [ ] `Toast` — success/error/info notifications
- [ ] `Table` — sortable, paginated
- [ ] `Skeleton` — card, row, text variants
- [ ] `EmptyState` — icon + message + action
- [ ] `Navbar` — customer navbar with cart
- [ ] `Sidebar` — admin sidebar with nav
- [ ] `SizeSelector` — toggle group for jersey sizes
- [ ] `QuantityStepper` — +/- with min/max
- [ ] `ImageUpload` — drag-drop with preview
- [ ] `StatusTimeline` — vertical stepper for order tracking
