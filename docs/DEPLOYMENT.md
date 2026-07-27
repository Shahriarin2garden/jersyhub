# Deployment — NexVive

Target: a real, publicly reachable storefront for roughly **200 customers/month**,
on free tiers wherever a free tier legitimately allows commercial use.

Researched July 2026. Free tiers move — re-check the limits before launch day.

---

## 1. The stack we're deploying onto

| Layer | Service | Plan | Cost |
|---|---|---|---|
| App hosting | **Netlify** | Starter | Free |
| Database | **Neon** Postgres | Free | Free |
| Images | **Cloudinary** | Free | Free |
| Transactional email | **Resend** | Free | Free |
| DNS + domain | **Cloudflare Registrar** | at-cost | **~$10.44/yr** |
| OTP SMS | BD gateway (Greenweb / BulkSMSBD) | prepaid | **~150 BDT/mo** |

Everything except the domain and OTP SMS is genuinely free at our volume.
Total running cost: **about $1–2/month plus $10.44 once a year.**

---

## 2. Host: why Netlify, and not the obvious choices

### Vercel Hobby — ruled out, and it isn't a close call

Vercel's Hobby plan is restricted to **non-commercial, personal use**. NexVive
sells jerseys and takes orders, so putting it on Hobby breaks Vercel's terms from
the first order — and Vercel does enforce this by warning and disabling accounts.
Going legitimate on Vercel means Pro at **$20/month**, which defeats the goal.

This matters more than it looks: Vercel is the default answer for a Next.js app
and the one most guides will point you at. It is the wrong answer here.

### Render free — ruled out on user experience

Render's free web services **spin down after 15 minutes of inactivity** and take
roughly **a minute to wake up**. A shop with 200 customers a month is idle most
of the day, so a large share of real visitors would land on a blank tab for ~60
seconds. That's a conversion killer, not a minor annoyance. (Render is still fine
as a fallback if Netlify ever becomes a problem — the app itself needs no changes
to run there.)

### Cloudflare Workers free — good, but not yet

Commercial use is allowed and there are no cold starts, which makes it appealing.
The blocker is the **3 MiB compressed bundle limit on the free plan**. Prisma
Client plus NextAuth plus the Next server runtime is very likely to exceed it, and
getting under would mean switching Prisma to driver adapters and re-verifying the
whole auth path. Worth revisiting later; not worth it for launch.

### Netlify Starter — what we're using

- **Commercial use is permitted on the free tier.** This is the deciding factor.
- Official **Next.js 16** support; the adapter maps SSR/API routes onto Netlify
  Functions automatically.
- Functions run **Node.js**, so Prisma works unchanged — no rewrite.
- Free allowance: **100 GB bandwidth**, **125,000 function invocations/month**,
  **300 build minutes/month**.

---

## 3. Does 200 users actually fit? (yes, with room to spare)

Assume 200 customers/month, ~15 page views each = **~3,000 page views/month**.

Every page in this app is `export const dynamic = "force-dynamic"`, so treat
each page view as one function invocation plus a few DB queries.

| Limit | Allowance | Our estimate | Headroom |
|---|---|---|---|
| Function invocations | 125,000/mo | ~3,000–5,000 | **25×** |
| Bandwidth | 100 GB/mo | ~2 GB (images come from Cloudinary) | **50×** |
| Build minutes | 300/mo | ~3 min/deploy → 100 deploys | fine |
| Resend email | 3,000/mo, **100/day** | ~400/mo | fine |
| Neon storage | 0.5 GB | well under | fine |

The daily Resend cap (100/day) is the one that would bite first, and only during
an unusual sales spike. Nothing here is close to a paid upgrade.

### The one number to watch: Neon compute

Neon's free plan gives **100 CU-hours/month** and autosuspends after 5 minutes
idle. At the 0.25 CU minimum, a database awake ~8 hours a day costs about
60 CU-hours/month — inside the allowance. But Neon can autoscale to 2 CU, which
would burn the budget **8× faster** and could exhaust it mid-month.

**Action: cap the compute autoscale range at 0.25–0.5 CU** in the Neon console.
Don't leave it at the 2 CU default.

---

## 4. Domain

There is no legitimate free custom domain in 2026 — Freenom is gone, and the
remaining "free domain" offers are either bundled with paid hosting or not worth
trusting with a business.

**Recommended: Cloudflare Registrar, ~$10.44/yr for a `.com`.** It sells at the
registry's wholesale cost with no markup, the **renewal price equals the
registration price** (no year-two surprise), and WHOIS privacy and DNSSEC are
included free.

One constraint: Cloudflare Registrar **requires Cloudflare nameservers**. That's
fine for us — we want Cloudflare DNS in front of Netlify anyway.

**Free fallback:** ship on `nexvive.netlify.app` and attach the domain later.
Netlify subdomains are free and fully functional; they just read as unfinished to
a customer being asked for payment details. Buy the domain.

Cheaper TLDs (`.xyz` etc.) run $2–3 the first year but renew higher — the saving
is one-off and the trust cost is permanent. Not recommended for a shop.

---

## 5. The one unavoidable running cost: OTP SMS

Customer login is phone + OTP, so every login sends an SMS. Bangladesh gateways
charge roughly **0.18–0.30 BDT per SMS** (Greenweb ~0.18, BulkSMSBD ~0.25).

200 users × ~3 logins/month ≈ **600 SMS ≈ 110–180 BDT/month (~$1–1.50)**, bought
as a prepaid pack. Twilio's trial credit will cover early testing and then run
out; a local gateway is cheaper and more reliable for BD numbers.

Note the app already supports both — `TWILIO_*` or the generic `SMS_API_*` HTTP
gateway variables.

> **Cost-cutting option:** if even this is unwanted at launch, OTP could move to
> email (Resend, free) and phone login could come later. That's a product change,
> not a deployment one — flagging it as a lever, not recommending it, since the
> phone-first decision was deliberate for BD customers.

---

## 6. Already done in the repo

These are committed, so the deploy steps below are only about accounts and keys:

- **`netlify.toml`** — build command runs `prisma migrate deploy` before
  `next build`, pins Node 22, loads the Next.js plugin.
- **Query caching** (`src/lib/cached.ts`) with tag invalidation wired into the
  admin product and review routes — see §7.
- **Prisma client reuse in production** (`src/lib/prisma.ts`). Without this,
  every warm serverless invocation built a new client and a new connection pool,
  which exhausts Postgres connections fast.
- **Security headers** (`next.config.ts`) — `X-Frame-Options: DENY`, nosniff,
  Referrer-Policy, Permissions-Policy, HSTS, plus `noindex` + `no-store` on
  `/admin/*`.
- **`robots.ts` / `sitemap.ts`** — storefront indexable; admin, API, account,
  cart and checkout excluded. Sitemap regenerates hourly.
- **Startup environment validation** (`src/lib/env.ts`, called from the root
  layout). Missing `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` or a
  placeholder `ADMIN_PASSWORD` fails the deploy loudly instead of serving a
  shop with forgeable sessions. Optional keys log a named warning.
- **Error boundaries** — `error.tsx`, `global-error.tsx` and a branded
  `not-found.tsx`. Previously an unhandled error showed Next's default grey
  screen with no route back into the catalogue.
- **Direct-to-Cloudinary image upload.** The admin's browser uploads straight
  to Cloudinary against a short-lived signature issued by
  `POST /api/admin/upload`. Uploads no longer pass through a serverless
  function, which has a ~6MB request-body limit that a 5MB image plus
  multipart overhead sits right at the edge of breaching — and which would
  otherwise cost function time and bandwidth to forward bytes. Images are
  transformed on delivery (`f_auto,q_auto,c_limit`), not at upload.

Verified with a real `npm run build` — it compiles clean.

### Two failure modes that are now closed

Both were cases where a missing environment variable degraded into something
worse than an outage:

- **OTP.** `requestOtp` returned the six-digit code in the HTTP response when
  no SMS gateway was configured. That is the intended development fallback,
  but it keyed on the gateway alone, not the environment — so a production
  deploy merely missing its SMS credentials was a full authentication bypass:
  any phone number, code read from the response, access to that customer's
  name, address and order history. Production now refuses to issue a code at
  all when no provider is configured.
- **Image upload.** Placeholder Cloudinary credentials produced a 401 deep in
  the request, presenting as a broken feature. Unset credentials are now
  detected up front and reported as configuration, naming the variables.

---

## 7. Step-by-step launch

### Step 1 — Database (Neon)

1. Create a project on Neon; region **Singapore** (`ap-southeast-1`) — closest to
   Bangladesh.
2. Set the compute autoscale range to **0.25–0.5 CU** (see §3).
3. Copy **the pooled connection string** — the host containing `-pooler`.
   Serverless functions open a connection per invocation and will exhaust a
   direct Postgres connection limit. Append Prisma's PgBouncer flags:

   ```
   postgresql://USER:PASS@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1
   ```

4. Keep the **direct** (non-pooler) URL too — migrations need it.

### Step 2 — Apply the schema

Run once from your machine, against the **direct** URL:

```bash
DATABASE_URL="<direct-url>" npx prisma migrate deploy
DATABASE_URL="<direct-url>" ADMIN_EMAIL="…" ADMIN_PASSWORD="…" npm run db:seed
```

`migrate deploy` applies the two existing migrations without prompting.

`db:seed` provisions only what a live shop needs: the single admin account
from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and the four categories. It is safe to
run against production and safe to re-run.

> **Do not run `db:seed:demo` against production.** That variant adds twelve
> demo products named after real clubs sharing one stock photograph, five
> fictional customers with Bangladeshi addresses, and five orders — which
> would show up in the admin dashboard as genuine revenue. It exists for
> development databases only.

### Step 3 — Third-party accounts

- **Cloudinary** — free account, note cloud name / API key / API secret.
- **Resend** — free account, verify the domain you bought, create an API key.
  Set `EMAIL_FROM` to an address on the verified domain.
- **SMS gateway** — Greenweb or BulkSMSBD, buy a starter pack, note the API URL,
  key, and approved sender ID.

### Step 4 — Netlify

1. Connect the GitHub repo (`Shahriarin2garden/jersyhub`) to a new Netlify site.
   Netlify detects Next.js and sets the build command itself.
2. Set the build command to include a migration step so schema changes ship with
   the code:

   ```
   npx prisma migrate deploy && npm run build
   ```

3. Set the environment variables. Copy `.env.netlify.example` to
   `.env.netlify` (gitignored), fill it in, then load the whole file at
   once rather than pasting values one by one in the UI:

   ```bash
   netlify env:import .env.netlify
   ```

### Step 5 — Environment variables (production values)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** URL with `pgbouncer=true&connection_limit=1` |
| `NEXTAUTH_URL` | `https://yourdomain.com` — must be the real domain, not localhost |
| `NEXTAUTH_SECRET` | **fresh** value from `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | strong, unique — never the `.env.example` placeholder |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |
| `RESEND_API_KEY`, `EMAIL_FROM` | from Resend, on the verified domain |
| `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER_ID` | from the BD gateway |

**Security, and I mean this literally:** generate a new `NEXTAUTH_SECRET` for
production and set a real admin password. Anyone who knows the placeholder values
in `.env.example` owns the admin panel — it's the single account that can see
every customer's name, phone, and address. Do not reuse dev values.

### Step 6 — Domain

1. Buy the domain at Cloudflare Registrar.
2. Add the custom domain in Netlify; follow its DNS instructions (a `CNAME` for
   `www`, Netlify's records for the apex).
3. Netlify provisions Let's Encrypt TLS automatically. Verify HTTPS works and
   that HTTP redirects to it.
4. Update `NEXTAUTH_URL` to the final domain and redeploy — auth callbacks break
   if this is stale.

### Step 7 — Pre-launch verification

- [ ] Place a real end-to-end order: browse → cart → checkout → order confirmation
- [ ] Confirm the order email arrives
- [ ] Log in as a customer with a real phone number; confirm the OTP SMS arrives
- [ ] Log into `/admin`, confirm the order is visible and the status flow works
- [ ] Upload a product image through the admin panel (proves Cloudinary works)
- [ ] Load the site on a real phone over mobile data, not just wifi
- [ ] Confirm the catalogue holds only real stock — `db:seed` no longer creates
      demo products, so a fresh production database starts empty by design

---

## 8. What to watch after launch

| Signal | Where | Why |
|---|---|---|
| Neon CU-hours used | Neon console | The tightest free limit we have (§3) |
| Function invocations | Netlify dashboard | Should sit near 3–5k/month |
| Resend daily sends | Resend dashboard | 100/day cap |
| SMS balance | Gateway portal | Login silently breaks at zero balance |

**First upgrade, if traffic grows:** not the host — the database. Neon compute
runs out before Netlify's limits do.

**On caching — correcting an earlier plan.** Page-level ISR (`export const
revalidate = 60`) is *not* possible here: `getT()` reads the locale from a
cookie, and `cookies()` forces dynamic rendering regardless of what `revalidate`
says. Removing that would mean giving up cookie-based i18n.

What we did instead, and it targets the same cost: the **database reads are
cached**, not the page render (`src/lib/cached.ts`). Pages still render per
request — that part is cheap — while the catalogue queries every visitor triggers
are served from cache for 5 minutes. Admin writes call `revalidateTag` so edits
publish immediately rather than waiting out the window.

The biggest single win there: `prisma.category.findMany` ran on **every store
page load** from the layout. It now runs at most once per 5 minutes.
