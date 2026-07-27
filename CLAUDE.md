# JersyHub — Project Instructions

Local business jersey marketplace. Customer storefront + admin dashboard.

## Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Neon PostgreSQL (free tier, 0.5GB)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (credentials provider, admin only)
- **Images**: Cloudinary (free tier, 25 credits/month)
- **Icons**: Lucide React (never use emoji as icons)
- **Hosting**: Netlify (Starter/free — commercial use permitted). Not Vercel: its
  Hobby plan forbids commercial use, and this is a real shop. See `docs/DEPLOYMENT.md`.

## Key Constraints

- **All services must be free tier.** No paid plans, no credit card required services.
- **Simple and minimal.** No over-engineering. No premature abstractions.
- **Mobile-first.** 60%+ users on mobile. Test at 375px.
- **No customer accounts for MVP.** Guest checkout only. Admin auth only.
- **No online payment gateway.** Manual bKash + cash on delivery.
- **Cart in localStorage.** No server-side cart.

## Project Structure

```
src/
├── app/
│   ├── (store)/              # Customer-facing layout group
│   │   ├── page.tsx          # Landing
│   │   ├── shop/page.tsx     # Catalog
│   │   ├── shop/[slug]/page.tsx  # Product detail
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order/[id]/page.tsx
│   ├── admin/                # Admin layout group
│   │   ├── page.tsx          # Login
│   │   ├── dashboard/page.tsx
│   │   ├── orders/
│   │   ├── products/
│   │   ├── customers/
│   │   └── layout.tsx        # Sidebar + auth guard
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Reusable primitives
│   ├── store/                # Customer components
│   └── admin/                # Admin components
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
└── types/
```

## Code Standards

- Use Server Components by default. Add `"use client"` only when needed (interactivity, hooks, browser APIs).
- Fetch data in Server Components, not in client components.
- Use Prisma for all DB queries. No raw SQL.
- Validate all user input at API boundaries using Zod.
- Use `next/image` for all images.
- Use `next/link` for all navigation.
- Tailwind only — no CSS modules, no styled-components.
- Design tokens defined in `tailwind.config.ts` — always use tokens, never hardcode colors.

## Conventions

- File naming: kebab-case for files, PascalCase for components.
- API routes return `{ data }` on success, `{ error }` on failure.
- Order statuses: `pending → confirmed → shipped → delivered` (+ `cancelled` branch).
- Order numbers: `JH-XXXXXX` format (6 random alphanumeric).
- Currency: BDT (৳). Format: `৳1,200`.
- Phone format: Bangladesh (01XXXXXXXXX, 11 digits).

## Reference Files

- `docs/DESIGN.md` — Full design system (colors, typography, spacing, components)
- `docs/ARCHITECTURE.md` — Database schema, API endpoints, deployment
- `docs/DEVELOPMENT.md` — Setup guide, environment variables, commands
