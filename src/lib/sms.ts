/**
 * SMS via a BD gateway (e.g. bulksmsbd). Env-driven; dev-logs when unset.
 * Set SMS_API_URL, SMS_API_KEY, SMS_SENDER_ID to enable.
 */
export async function sendSms(phone: string, text: string): Promise<boolean> {
  const url = process.env.SMS_API_URL;
  const key = process.env.SMS_API_KEY;
  if (!url || !key) {
    console.log(`[sms:dev] → ${phone} | ${text}`);
    return true;
  }
  try {
    const params = new URLSearchParams({
      api_key: key,
      senderid: process.env.SMS_SENDER_ID ?? "",
      number: phone,
      message: text,
    });
    const res = await fetch(`${url}?${params.toString()}`);
    return res.ok;
  } catch (e) {
    console.error("SMS send failed", e);
    return false;
  }
}
