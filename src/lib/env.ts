/**
 * Environment validation.
 *
 * Twice now a missing variable has degraded into something worse than an
 * outage: OTP handed the login code to the caller when no SMS gateway was
 * set, and image upload presented itself as a broken feature when Cloudinary
 * held `.env.example` placeholders. Both were fixed at the point of use. This
 * is the general guard — the deploy announces what is missing instead of
 * waiting for a customer to find it.
 *
 * Two tiers:
 *
 *   REQUIRED — the site cannot serve correctly without them. Missing in
 *   production, we throw. A hard failure with a named cause is better than a
 *   shop that takes orders against no database, or issues session cookies
 *   signed with a default secret that anyone can forge.
 *
 *   OPTIONAL — gates one feature, and that feature already fails closed on its
 *   own. Missing, we log once at startup so it is visible in the deploy log
 *   rather than discovered by an admin who cannot upload a photo.
 */

const REQUIRED = [
  ["DATABASE_URL", "Postgres connection string (use Neon's pooled -pooler host)"],
  ["NEXTAUTH_SECRET", "generate with: openssl rand -base64 32"],
  ["NEXTAUTH_URL", "the site's public origin, e.g. https://nexvive.com"],
] as const;

const OPTIONAL = [
  [
    ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
    "product image upload is disabled",
  ],
  [["RESEND_API_KEY"], "order emails will not be sent"],
  [
    ["TWILIO_ACCOUNT_SID", "SMS_API_URL"],
    "customer phone login is disabled (no OTP can be delivered)",
  ],
] as const;

const PLACEHOLDERS = new Set([
  "demo",
  "000",
  "your-cloud-name",
  "your-api-key",
  "your-api-secret",
  "change-this-strong-password",
  "generate-with: openssl rand -base64 32",
]);

/**
 * Substrings that only ever appear in an unfilled template. A set value is not
 * the same as a configured one: a `DATABASE_URL` still carrying `USER:PASSWORD`
 * passes an emptiness check and then fails at the first query, which is how a
 * build reached the database layer before failing.
 */
const TEMPLATE_MARKERS = [
  "USER:PASSWORD",
  "ep-xxxx",
  "YOURDOMAIN",
  "your-",
  "xxx",
];

function isSet(name: string): boolean {
  const v = process.env[name]?.trim();
  if (!v) return false;
  if (PLACEHOLDERS.has(v)) return false;
  return !TEMPLATE_MARKERS.some((m) => v.includes(m));
}

let checked = false;

/**
 * Run once, from the root layout. Safe to call repeatedly — the work happens
 * on the first call only.
 */
export function assertEnv(): void {
  if (checked) return;
  checked = true;

  if (process.env.NODE_ENV !== "production") return;

  const missing = REQUIRED.filter(([name]) => !isSet(name));
  if (missing.length > 0) {
    throw new Error(
      "Missing required environment variables:\n" +
        missing.map(([name, hint]) => `  - ${name} — ${hint}`).join("\n") +
        "\nSet them in the host's environment settings and redeploy.",
    );
  }

  // A single admin account can read every customer's name, phone number and
  // delivery address. Shipping the committed placeholder password means that
  // account is public knowledge, so this is treated as fatal, not advisory.
  if (!isSet("ADMIN_PASSWORD")) {
    throw new Error(
      "ADMIN_PASSWORD is unset or still the placeholder from .env.example. " +
        "The admin account can read every customer's name, phone and address — " +
        "set a strong, unique password and re-run the seed.",
    );
  }

  for (const [names, consequence] of OPTIONAL) {
    if (!names.some(isSet)) {
      console.warn(
        `[env] ${names.join(" / ")} not set — ${consequence}.`,
      );
    }
  }
}
