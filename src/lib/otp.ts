import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

const OTP_TTL_MIN = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SEC = 60;

function sixDigit(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Create + send an OTP. Enforces a resend cooldown. */
export async function requestOtp(phone: string): Promise<{ ok: boolean; error?: string; devCode?: string }> {
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

  await sendSms(phone, `Your JersyHub verification code is ${code}. Valid for ${OTP_TTL_MIN} minutes.`);

  // In dev (no SMS gateway) expose the code so login is testable.
  const devCode = process.env.SMS_API_KEY ? undefined : code;
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
