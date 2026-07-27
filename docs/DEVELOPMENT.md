# JersyHub — Development Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Git
- GitHub account
- Neon account (free): https://neon.tech
- Cloudinary account (free): https://cloudinary.com
- Render account (free): https://render.com

## Initial Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install project-specific packages

```bash
# Core
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install cloudinary next-cloudinary
npm install lucide-react
npm install zod

# Dev
npm install -D prisma
```

### 3. Environment variables

Create `.env.local` in project root:

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Fixed single admin (seed upserts this and deletes any other admin row)
ADMIN_EMAIL="admin@nexvive.com"
ADMIN_PASSWORD="change-this-strong-password"

# SMS / OTP — customer login sends a 6-digit code to a BD phone.
# Leave ALL blank in dev: the code is returned in the app response so login works.
# Twilio (global, incl. BD; free trial):
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM=""
# OR a Bangladesh gateway (bulksmsbd.net / sms.net.bd style):
SMS_API_URL=""
SMS_API_KEY=""
SMS_SENDER_ID=""
```

**Admin is a single fixed account.** There is no admin sign-up flow; `npm run
db:seed` (or editing `ADMIN_EMAIL`/`ADMIN_PASSWORD` then re-seeding) is the only
way to set it, and the seed removes every other admin row so exactly one remains.

**OTP flow:** `requestOtp` (`src/lib/otp.ts`) generates a 6-digit code, stores a
bcrypt hash with a 5-min TTL, 60s resend cooldown, and 5-attempt cap, then calls
`sendSms` (`src/lib/sms.ts`). With no provider configured the code is returned as
`devCode` so login is testable; configure Twilio or a BD gateway to send real SMS.
BD numbers are normalised to `8801XXXXXXXXX` before dispatch.

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database setup

```bash
# Initialize Prisma
npx prisma init

# After writing schema.prisma:
npx prisma migrate dev --name init
npx prisma generate

# Seed admin user + sample data
npx prisma db seed
```

### 5. Tailwind config

Add design tokens to `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          light: "#EDE9FE",
          dark: "#4C1D95",
        },
        secondary: "#A78BFA",
        accent: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        destructive: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
        },
        background: "#FAF5FF",
        card: "#FFFFFF",
        muted: "#ECEEF9",
        foreground: "#4C1D95",
        "text-secondary": "#5a5270",
        "text-muted": "#8a839c",
        border: "#DDD6FE",
        // Status colors
        status: {
          pending: { bg: "#FAEEDA", text: "#854F0B" },
          confirmed: { bg: "#E6F1FB", text: "#185FA5" },
          shipped: { bg: "#EDE9FE", text: "#7C3AED" },
          delivered: { bg: "#DCFCE7", text: "#16A34A" },
          cancelled: { bg: "#FEF2F2", text: "#DC2626" },
        },
      },
      fontFamily: {
        display: ["Barlow Condensed", "Impact", "Arial Narrow", "sans-serif"],
        body: ["Barlow", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        badge: "20px",
        modal: "16px",
      },
      spacing: {
        // extends default with custom tokens if needed
      },
    },
  },
  plugins: [],
};

export default config;
```

## Commands

| Command                        | Purpose                         |
|-------------------------------|---------------------------------|
| `npm run dev`                  | Start dev server (port 3000)    |
| `npm run build`                | Production build                |
| `npm start`                    | Start production server         |
| `npm run lint`                 | ESLint check                    |
| `npx prisma studio`           | Visual database editor          |
| `npx prisma migrate dev`      | Create + apply migration        |
| `npx prisma generate`         | Regenerate Prisma client        |
| `npx prisma db seed`          | Seed database                   |
| `npx prisma migrate deploy`   | Apply migrations (production)   |

## Development Workflow

1. Create feature branch: `git checkout -b feature/page-name`
2. Build the page/component
3. Test on mobile viewport (375px)
4. Test dark mode
5. Commit with clear message
6. Push and create PR

## Deployment to Render

### First deploy

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Settings:
   - **Build command**: `npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free
5. Add all env vars from `.env.local` (use production values)
6. Deploy

### Subsequent deploys

Push to `main` branch → Render auto-deploys.

## Neon Database Setup

1. Sign up at https://neon.tech (GitHub login)
2. Create project: "jersyhub"
3. Copy connection string from dashboard
4. Paste into `DATABASE_URL` in `.env.local`
5. Connection string format: `postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require`

**Free tier notes:**
- 0.5GB storage (plenty for MVP — ~50K product rows)
- Auto-suspends after 5min idle, auto-wakes on connect (~2s)
- 1 project, 10 branches

## Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Dashboard shows: Cloud Name, API Key, API Secret
3. Set env vars
4. Create upload preset: Settings → Upload → Add upload preset
   - Preset name: `jersyhub`
   - Signing mode: Unsigned (for client-side uploads) or Signed (for server-side)
   - Folder: `jersyhub/products`
   - Transformations: auto quality, auto format, max width 1200px

**Free tier notes:**
- 25 credits/month
- 1 credit = 1GB storage OR 1GB bandwidth OR 1,000 transforms
- Enough for ~200 product images with transforms

## Folder Structure Rationale

```
src/app/(store)/     Route group — shares customer layout (navbar + footer)
                     without affecting URL paths
src/app/admin/       Separate layout with sidebar + auth guard
src/components/ui/   Atomic components: Button, Input, Card, Badge, Modal, etc.
src/components/store/ Customer-specific: ProductCard, CartDrawer, CheckoutForm, etc.
src/components/admin/ Admin-specific: OrderTable, StatCard, Sidebar, etc.
src/lib/             Utilities: prisma client, auth config, helpers
src/hooks/           Custom hooks: useCart, useDebounce, etc.
src/types/           Shared TypeScript types/interfaces
```

## Seed Data

The seed script (`prisma/seed.ts`) should create:

1. Admin user (email + hashed password from env)
2. 4 categories: Football, Cricket, Basketball, Custom
3. 10-15 sample products with variants (sizes + stock)
4. 5 sample customers with orders (for dashboard testing)

Run: `npx prisma db seed`

## Key Implementation Notes

### Cart (localStorage)

```typescript
// src/hooks/useCart.ts
// Use React Context + useReducer
// Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART
// Persist to localStorage on every change
// Hydrate from localStorage on mount (handle SSR mismatch)
```

### Image Upload Flow

```
Admin uploads image
  → POST /api/admin/upload (FormData)
  → Server uploads to Cloudinary
  → Returns Cloudinary URL
  → URL stored in product.images[] array
```

### Order Creation Flow

```
Customer submits checkout form
  → POST /api/orders
  → Validate input (Zod)
  → Find or create Customer (by phone number)
  → Create Order + OrderItems + initial StatusHistory
  → Deduct stock from ProductVariants
  → Return order number for tracking page
```

### Order Number Generation

```typescript
// Format: JH-XXXXXX (6 alphanumeric chars)
function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let result = "JH-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```
