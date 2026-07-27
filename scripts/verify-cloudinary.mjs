/**
 * End-to-end check of the image upload path.
 *
 *     node scripts/verify-cloudinary.mjs
 *
 * Exercises exactly what the admin panel does — sign, upload from outside the
 * server, fetch the transformed delivery URL — rather than asserting that the
 * credentials merely look present. The signature maths can be verified on
 * paper; that Cloudinary accepts it cannot.
 *
 * Uploads a 1x1 pixel and deletes it again, so a free-tier credit budget is
 * not spent on test assets.
 */
import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

config();

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const FOLDER = "jersyhub/verify";

const PLACEHOLDERS = new Set([
  "demo",
  "000",
  "your-cloud-name",
  "your-api-key",
  "your-api-secret",
]);

let step = 0;
const pass = (m) => console.log(`  \x1b[32mPASS\x1b[0m  ${m}`);
const fail = (m) => {
  console.log(`  \x1b[31mFAIL\x1b[0m  ${m}`);
  process.exitCode = 1;
};
const head = (m) => console.log(`\n${++step}. ${m}`);

head("Credentials present and not placeholders");
if (!CLOUD || !KEY || !SECRET) {
  fail("One or more of the three Cloudinary variables is unset in .env");
  process.exit(1);
}
if ([CLOUD, KEY, SECRET].some((v) => PLACEHOLDERS.has(v))) {
  fail("Still holding .env.example placeholders — fill in the real values");
  process.exit(1);
}
if (!/^\d+$/.test(KEY)) {
  fail(
    `CLOUDINARY_API_KEY is "${KEY.slice(0, 4)}…" — the API key is numeric. ` +
      "This looks like the API secret; the two are easy to swap.",
  );
  process.exit(1);
}
pass(`cloud "${CLOUD}", key ${KEY.length} digits, secret ${SECRET.length} chars`);

cloudinary.config({
  cloud_name: CLOUD,
  api_key: KEY,
  api_secret: SECRET,
  secure: true,
});

head("Credentials accepted by Cloudinary");
try {
  const usage = await cloudinary.api.usage();
  const c = usage.credits ?? {};
  pass(
    `authenticated — plan "${usage.plan}", credits used ${c.used ?? "?"} of ${c.limit ?? "?"}`,
  );
} catch (e) {
  fail(`Cloudinary rejected the credentials: ${e?.error?.message ?? e.message}`);
  process.exit(1);
}

head("Signature is accepted for a browser upload");
const timestamp = Math.round(Date.now() / 1000);
const signature = cloudinary.utils.api_sign_request(
  { folder: FOLDER, timestamp },
  SECRET,
);

// A 1x1 transparent PNG — the smallest thing that is still a real image.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const form = new FormData();
form.append("file", new Blob([png], { type: "image/png" }), "verify.png");
form.append("api_key", KEY);
form.append("timestamp", String(timestamp));
form.append("folder", FOLDER);
form.append("signature", signature);

let uploaded;
try {
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body: form },
  );
  const json = await res.json();
  if (!res.ok) {
    fail(`upload rejected: ${json?.error?.message ?? JSON.stringify(json)}`);
    process.exit(1);
  }
  uploaded = json;
  pass(`uploaded to ${json.public_id}`);
} catch (e) {
  fail(`upload request failed: ${e.message}`);
  process.exit(1);
}

head("Transformed delivery URL serves");
const marker = "/image/upload/";
const [h, t] = uploaded.secure_url.split(marker);
const delivered = `${h}${marker}f_auto,q_auto,c_limit,w_192/${t}`;
try {
  const res = await fetch(delivered);
  if (res.ok) {
    pass(`${res.status} ${res.headers.get("content-type")} — ${delivered}`);
  } else {
    fail(`delivery URL returned ${res.status}: ${delivered}`);
  }
} catch (e) {
  fail(`delivery fetch failed: ${e.message}`);
}

head("Cleaning up the test asset");
try {
  await cloudinary.uploader.destroy(uploaded.public_id);
  pass(`deleted ${uploaded.public_id}`);
} catch (e) {
  fail(`could not delete ${uploaded.public_id} — remove it manually: ${e.message}`);
}

console.log(
  process.exitCode
    ? "\n\x1b[31mUpload path is NOT working.\x1b[0m See the failure above.\n"
    : "\n\x1b[32mUpload path verified end to end.\x1b[0m Admin image upload will work.\n",
);
