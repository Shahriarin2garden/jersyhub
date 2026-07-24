import type { Coupon } from "@prisma/client";

export type CouponResult =
  | { ok: true; discount: number; coupon: Coupon }
  | { ok: false; error: string };

/** Validate a coupon against a subtotal and compute the discount amount. */
export function evaluateCoupon(coupon: Coupon | null, subtotal: number): CouponResult {
  if (!coupon || !coupon.active) return { ok: false, error: "Invalid coupon" };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { ok: false, error: "Coupon expired" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { ok: false, error: "Coupon usage limit reached" };
  if (subtotal < coupon.minSubtotal)
    return { ok: false, error: `Minimum order ৳${coupon.minSubtotal} for this coupon` };

  let discount =
    coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal); // never exceed subtotal
  discount = Math.round(discount);

  return { ok: true, discount, coupon };
}
