import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendSms, smsConfigured } from "@/lib/sms";

const OTP_TTL_MIN = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SEC = 60;

function sixDigit(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Create + send an OTP. Enforces a resend cooldown.
 *
 * Fails closed in production when no SMS provider is configured. The dev
 * fallback returns the code to the caller so login is testable without a
 * gateway, and that behaviour keyed only on whether SMS was configured — so a
 * production deploy that was merely missing its SMS credentials would have
 * handed the code to whoever asked for it. Any phone number, no possession
 * check, full access to that customer's name, address and order history.
 * A missing environment variable must not degrade into an open door, so
 * production refuses to issue a code at all rather than expose one.
 */
export async function requestOtp(phone: string): Promise<{ ok: boolean; error?: string; devCode?: string }> {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !smsConfigured()) {
    console.error(
      "OTP requested but no SMS provider is configured. Set TWILIO_* or SMS_API_* — refusing to issue a code.",
    );
    return { ok: false, error: "Login by phone is temporarily unavailable. Please try again later." };
  }

  const recent = await prisma.otp.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SEC * 1000) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) return { ok: false, error: "Please wait before requesting another code" };

  const code = sixDigit();
  const codeHash = await bcrypt.hash(code, 10);

  // Invalidate previous codes for this phone.
  await prisma.otp.deleteMany({ where: { phone } });
  await prisma.otp.create({
    data: { phone, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60 * 1000) },
  });

  const delivered = await sendSms(
    phone,
    `Your NexVive verification code is ${code}. Valid for ${OTP_TTL_MIN} minutes.`,
  );

  // A configured provider that fails to deliver must not silently "succeed" —
  // drop the record so the user can retry immediately (not blocked by cooldown).
  if (smsConfigured() && !delivered) {
    await prisma.otp.deleteMany({ where: { phone } });
    return { ok: false, error: "Could not send the code. Please try again." };
  }

  // Dev only, and only when there is no gateway to deliver through. The
  // production guard above means this branch is unreachable when NODE_ENV is
  // "production"; the check is repeated here so the exposure is impossible to
  // reintroduce by editing the guard alone.
  const devCode = !isProd && !smsConfigured() ? code : undefined;
  return { ok: true, devCode };
}

/** Verify a submitted OTP. Consumes the record on success. */
export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const record = await prisma.otp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "No code found. Request a new one." };
  if (record.expiresAt < new Date()) {
    await prisma.otp.deleteMany({ where: { phone } });
    return { ok: false, error: "Code expired. Request a new one." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otp.deleteMany({ where: { phone } });
    return { ok: false, error: "Too many attempts. Request a new one." };
  }

  const valid = await bcrypt.compare(code, record.codeHash);
  if (!valid) {
    await prisma.otp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "Incorrect code" };
  }

  await prisma.otp.deleteMany({ where: { phone } });
  return { ok: true };
}
