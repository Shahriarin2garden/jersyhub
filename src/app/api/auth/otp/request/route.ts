import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, fromZod } from "@/lib/api";
import { phoneSchema } from "@/lib/validations";
import { requestOtp } from "@/lib/otp";

const schema = z.object({ phone: phoneSchema });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const result = await requestOtp(parsed.data.phone);
  if (!result.ok) return fail(result.error ?? "Could not send code", 429);

  // devCode is only present when no SMS gateway is configured (local testing).
  return ok({ sent: true, devCode: result.devCode });
}
