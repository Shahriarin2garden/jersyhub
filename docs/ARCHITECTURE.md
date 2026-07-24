# JersyHub — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Render (Free)                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           Next.js 15 (App Router)             │   │
│  │  ┌────────────────┐  ┌─────────────────────┐ │   │
│  │  │ Customer Store  │  │  Admin Dashboard    │ │   │
│  │  │ (Server + Client│  │ (Protected Routes)  │ │   │
│  │  │  Components)    │  │                     │ │   │
│  │  └────────────────┘  └─────────────────────┘ │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │         API Routes (/api/*)              │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
└──────────┬─────────────────────┬────────────────────┘
           │                     │
    ┌──────▼──────┐       ┌──────▼──────┐
    │ Neon (Free) │       │ Cloudinary  │
    │ PostgreSQL  │       │ (Free 25cr) │
    │  0.5GB      │       │ Images/CDN  │
    └─────────────┘       └─────────────┘
```

## Tech Stack Detail

| Layer      | Technology           | Free Tier Limits                        |
|------------|---------------------|-----------------------------------------|
| Frontend   | Next.js 15 + React 19| Open source                            |
| Styling    | Tailwind CSS         | Open source                            |
| Backend    | Next.js API Routes   | Same deployment                        |
| Database   | Neon PostgreSQL      | 0.5GB storage, auto-sleep/wake, no forced pause |
| ORM        | Prisma               | Open source                            |
| Auth       | NextAuth.js v5       | Open source, credentials provider      |
| Images     | Cloudinary           | 25 credits/month (~25GB or 25K transforms) |
| Icons      | Lucide React         | Open source                            |
| Hosting    | Render               | 750 hrs/month, commercial OK, ~30s cold start |
| Domain     | User's choice        | Can use free Render subdomain for MVP  |

### Why These Choices

**Render over Vercel**: Vercel Hobby plan bans commercial use. Render free tier allows commercial. Tradeoff: 30s cold start after 15min idle.

**Neon over Supabase**: Supabase pauses projects after 7 days inactivity (must manually unpause). Neon auto-sleeps but auto-wakes on connection (~2s cold start). Live store can't randomly go offline.

**Cloudinary stays**: 25 credits/month is enough for a small jersey catalog. Auto-optimizes images (WebP, resize). No good free alternative with same transform capabilities.

**No Supabase Auth**: We only need admin auth (1-2 users). NextAuth credentials provider handles this with zero external dependencies.

## Database Schema

### Entity Relationship

```
Category 1──* Product 1──* ProductVariant
                │
                * OrderItem *──1 Order *──1 Customer
                                  │
                                  * OrderStatusHistory
```

### Tables

#### Category
```sql
id            String   @id @default(cuid())
name          String
slug          String   @unique
image         String?
displayOrder  Int      @default(0)
createdAt     DateTime @default(now())
updatedAt     DateTime @updatedAt
```

#### Product
```sql
id          String   @id @default(cuid())
name        String
slug        String   @unique
description String?
price       Float
categoryId  String
images      String[]           -- Cloudinary URLs
status      ProductStatus      -- DRAFT | PUBLISHED
featured    Boolean  @default(false)
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt

-- Relations
category    Category @relation
variants    ProductVariant[]
orderItems  OrderItem[]
```

#### ProductVariant
```sql
id        String @id @default(cuid())
productId String
size      Size   -- S | M | L | XL | XXL
stock     Int    @default(0)

-- Relations
product   Product @relation
```

#### Customer
```sql
id        String   @id @default(cuid())
name      String
phone     String   @unique    -- 01XXXXXXXXX format
email     String?
division  String
district  String
address   String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

-- Relations
orders    Order[]
```

#### Order
```sql
id            String        @id @default(cuid())
orderNumber   String        @unique  -- JH-XXXXXX
customerId    String
status        OrderStatus   -- PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
paymentMethod PaymentMethod -- BKASH | COD
paymentStatus PaymentStatus -- UNPAID | PAID
bkashTxnId    String?
subtotal      Float
deliveryFee   Float         @default(0)
total         Float
notes         String?
createdAt     DateTime      @default(now())
updatedAt     DateTime      @updatedAt

-- Relations
customer      Customer @relation
items         OrderItem[]
statusHistory OrderStatusHistory[]
```

#### OrderItem
```sql
id         String @id @default(cuid())
orderId    String
productId  String
variantId  String
quantity   Int
unitPrice  Float
totalPrice Float

-- Relations
order      Order          @relation
product    Product        @relation
variant    ProductVariant @relation
```

#### OrderStatusHistory
```sql
id        String      @id @default(cuid())
orderId   String
status    OrderStatus
note      String?
createdAt DateTime    @default(now())

-- Relations
order     Order @relation
```

#### Admin
```sql
id           String   @id @default(cuid())
email        String   @unique
passwordHash String
name         String
createdAt    DateTime @default(now())
```

### Enums

```prisma
enum ProductStatus {
  DRAFT
  PUBLISHED
}

enum Size {
  S
  M
  L
  XL
  XXL
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  BKASH
  COD
}

enum PaymentStatus {
  UNPAID
  PAID
}
```

## API Endpoints

### Public (Customer)

| Method | Path                    | Purpose                              | Request Body / Params          |
|--------|------------------------|--------------------------------------|-------------------------------|
| GET    | `/api/products`         | List products                        | `?category=&search=&sort=&page=&limit=` |
| GET    | `/api/products/[slug]`  | Product detail                       | —                             |
| GET    | `/api/categories`       | List categories                      | —                             |
| POST   | `/api/orders`           | Create order                         | `{ customer, items[], paymentMethod, notes? }` |
| GET    | `/api/orders/[orderNumber]` | Order tracking                  | Uses orderNumber, not ID      |

### Admin (Protected — require NextAuth session)

| Method | Path                        | Purpose                | Request Body                      |
|--------|----------------------------|------------------------|-----------------------------------|
| GET    | `/api/admin/dashboard`      | Dashboard stats        | —                                 |
| GET    | `/api/admin/orders`         | List orders            | `?status=&search=&page=&limit=`   |
| GET    | `/api/admin/orders/[id]`    | Order detail           | —                                 |
| PATCH  | `/api/admin/orders/[id]`    | Update order status    | `{ status, note? }`              |
| GET    | `/api/admin/products`       | List products          | `?status=&search=&page=`          |
| POST   | `/api/admin/products`       | Create product         | `{ name, description, price, categoryId, variants[], images[] }` |
| PATCH  | `/api/admin/products/[id]`  | Update product         | Partial product fields            |
| DELETE | `/api/admin/products/[id]`  | Delete product         | —                                 |
| GET    | `/api/admin/customers`      | List customers         | `?search=&page=&limit=`           |
| GET    | `/api/admin/customers/[id]` | Customer detail        | —                                 |
| POST   | `/api/admin/upload`         | Upload image           | FormData with file                |

### Response Format

```typescript
// Success
{ data: T }

// Error
{ error: string, details?: Record<string, string> }

// Paginated
{ data: T[], pagination: { page: number, limit: number, total: number, totalPages: number } }
```

## Authentication

- NextAuth.js v5 with credentials provider
- Admin-only (no customer auth in MVP)
- JWT sessions stored in HTTP-only cookies
- Single admin seeded via Prisma seed script
- Protected routes via middleware (`/admin/*` except `/admin` login page)

```typescript
// middleware.ts — protect admin routes
export { default } from "next-auth/middleware"
export const config = { matcher: ["/admin/dashboard/:path*", "/admin/orders/:path*", "/admin/products/:path*", "/admin/customers/:path*"] }
```

## Cart Architecture

- Stored in `localStorage` (no auth needed)
- Cart context via React Context + useReducer
- Shape: `{ items: CartItem[], updatedAt: timestamp }`
- CartItem: `{ productId, variantId, name, size, price, quantity, image }`
- Max 20 items per cart
- Cart survives page refresh, clears on order completion

## Deployment

### Render Setup

1. Connect GitHub repo to Render
2. Build command: `npm run build`
3. Start command: `npm start`
4. Set environment variables (see DEVELOPMENT.md)
5. Free tier auto-assigns `*.onrender.com` subdomain

### Neon Setup

1. Create free project at neon.tech
2. Copy connection string
3. Set `DATABASE_URL` env var in Render
4. Run `npx prisma migrate deploy` via Render build command

### Cloudinary Setup

1. Create free account at cloudinary.com
2. Copy cloud name, API key, API secret
3. Set env vars in Render

## Performance Targets

| Metric          | Target  |
|-----------------|---------|
| First paint     | < 1.5s  |
| LCP             | < 2.5s  |
| CLS             | < 0.1   |
| Bundle size     | < 200KB initial JS |
| Image format    | WebP via Cloudinary |
| Caching         | ISR for product pages (60s revalidate) |
