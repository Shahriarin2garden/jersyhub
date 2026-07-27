/**
 * SMS delivery for OTP and order alerts. Real, provider-agnostic:
 *
 *   1. Twilio         — set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 *                       (global reach incl. Bangladesh; free trial credit).
 *   2. BD gateway     — set SMS_API_URL + SMS_API_KEY (+ SMS_SENDER_ID)
 *                       (bulksmsbd.net / sms.net.bd style HTTP API).
 *   3. Dev fallback   — neither set: logs to the console so login is testable.
 *
 * The first configured provider wins. BD phone numbers are normalised to the
 * international `8801XXXXXXXXX` form before dispatch, whatever the caller passed.
 */

/** `01712345678` / `+8801712345678` / `8801712345678` → `8801712345678`. */
export function normalizeBdPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) return `880${digits}`;
  return digits;
}

async function sendViaTwilio(to: string, text: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM!;
  const body = new URLSearchParams({ To: `+${to}`, From: from, Body: text });
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!res.ok) {
      console.error("Twilio SMS error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Twilio SMS failed", e);
    return false;
  }
}

async function sendViaBdGateway(to: string, text: string): Promise<boolean> {
  const url = process.env.SMS_API_URL!;
  const params = new URLSearchParams({
    api_key: process.env.SMS_API_KEY!,
    senderid: process.env.SMS_SENDER_ID ?? "",
    type: "text",
    number: to,
    message: text,
  });
  try {
    const res = await fetch(`${url}?${params.toString()}`);
    const raw = await res.text();
    // bulksmsbd returns response_code 202 on success; sms.net.bd returns error:0.
    const ok = res.ok && /"?(response_code)"?\s*:\s*202|"error"\s*:\s*0|success/i.test(raw);
    if (!ok) console.error("BD SMS gateway error", res.status, raw);
    return ok;
  } catch (e) {
    console.error("BD SMS gateway failed", e);
    return false;
  }
}

export async function sendSms(phone: string, text: string): Promise<boolean> {
  const to = normalizeBdPhone(phone);

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    return sendViaTwilio(to, text);
  }
  if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
    return sendViaBdGateway(to, text);
  }

  console.log(`[sms:dev] → ${to} | ${text}`);
  return true;
}

/** True when a real SMS provider is configured (used to hide the dev OTP code). */
export function smsConfigured(): boolean {
  return Boolean(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) ||
      (process.env.SMS_API_URL && process.env.SMS_API_KEY),
  );
}
