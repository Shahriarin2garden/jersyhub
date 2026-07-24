/**
 * Email via Resend. Falls back to console logging in dev (no RESEND_API_KEY).
 * Free tier: https://resend.com
 */
const FROM = process.env.EMAIL_FROM ?? "JersyHub <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] → ${opts.to} | ${opts.subject}`);
    return true;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  }
}

const brandWrap = (body: string) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#4c1d95">
    <h1 style="font-size:22px;color:#7c3aed;margin:0 0 12px">JersyHub</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #ddd6fe;margin:20px 0" />
    <p style="font-size:12px;color:#8a839c">JersyHub — Premium jerseys, local prices.</p>
  </div>`;

export function orderPlacedEmail(orderNumber: string, name: string, total: string) {
  return brandWrap(`
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been placed. Total: <strong>${total}</strong>.</p>
    <p>We'll confirm it shortly. Track it anytime with your order number.</p>`);
}

export function orderStatusEmail(orderNumber: string, name: string, status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "confirmed and is being prepared",
    SHIPPED: "shipped and on the way",
    DELIVERED: "delivered — enjoy!",
    CANCELLED: "cancelled",
  };
  return brandWrap(`
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> is now <strong>${map[status] ?? status.toLowerCase()}</strong>.</p>`);
}
