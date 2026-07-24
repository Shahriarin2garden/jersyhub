"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { DIVISIONS, DIVISION_NAMES, BKASH_NUMBER } from "@/lib/constants";
import { customerSchema } from "@/lib/validations";

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, clear, hydrated } = useCart();
  const router = useRouter();
  const toast = useToast();

  const [division, setDivision] = React.useState("");
  const [payment, setPayment] = React.useState<"COD" | "BKASH">("COD");
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Coupon
  const [couponInput, setCouponInput] = React.useState("");
  const [coupon, setCoupon] = React.useState<{ code: string; discount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = React.useState(false);

  const districts = division ? DIVISIONS[division] ?? [] : [];
  const discount = coupon?.discount ?? 0;
  const grandTotal = Math.max(0, subtotal - discount) + deliveryFee;

  async function applyCoupon() {
    if (!couponInput.trim() || applyingCoupon) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCoupon(null);
        toast(json.error ?? "Invalid coupon", "error");
        return;
      }
      setCoupon({ code: json.data.code, discount: json.data.discount });
      toast(`Coupon applied: −${formatPrice(json.data.discount)}`, "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setApplyingCoupon(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-text-secondary">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-primary hover:underline">
          Go shopping
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    const customer = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      division: String(fd.get("division") ?? ""),
      district: String(fd.get("district") ?? ""),
      address: String(fd.get("address") ?? ""),
    };

    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        errs[issue.path.join(".")] = issue.message;
      setErrors(errs);
      toast("Please fix the highlighted fields", "error");
      return;
    }

    const bkashTxnId = String(fd.get("bkashTxnId") ?? "");
    if (payment === "BKASH" && bkashTxnId.trim().length < 4) {
      setErrors({ bkashTxnId: "Enter your bKash transaction ID" });
      toast("bKash transaction ID required", "error");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { ...customer, email: customer.email || undefined },
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          paymentMethod: payment,
          bkashTxnId: payment === "BKASH" ? bkashTxnId : undefined,
          couponCode: coupon?.code,
          notes: String(fd.get("notes") ?? "") || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Order failed", "error");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/${json.data.orderNumber}`);
    } catch {
      toast("Network error. Try again.", "error");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold uppercase text-foreground">
        Checkout
      </h1>

      <form
        onSubmit={onSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        {/* Form */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Delivery details
            </h2>
            <Input label="Full name" name="name" required error={errors.name} />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              error={errors.phone}
            />
            <Input
              label="Email (optional)"
              name="email"
              type="email"
              error={errors["email"]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Division"
                name="division"
                required
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                error={errors.division}
              >
                <option value="">Select division</option>
                {DIVISION_NAMES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
              <Select
                label="District"
                name="district"
                required
                disabled={!division}
                error={errors.district}
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Full address"
              name="address"
              required
              placeholder="House, road, area…"
              error={errors.address}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["COD", "BKASH"] as const).map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-2 rounded-button border p-3 ${
                    payment === m ? "border-primary bg-primary-light" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m}
                    checked={payment === m}
                    onChange={() => setPayment(m)}
                    className="size-4 accent-primary"
                  />
                  <span className="font-medium text-foreground">
                    {m === "COD" ? "Cash on delivery" : "bKash"}
                  </span>
                </label>
              ))}
            </div>

            {payment === "BKASH" && (
              <div className="space-y-2 rounded-button bg-muted p-3">
                <p className="text-sm text-text-secondary">
                  Send money to bKash <strong>{BKASH_NUMBER}</strong>, then enter
                  the transaction ID below.
                </p>
                <Input
                  label="bKash transaction ID"
                  name="bkashTxnId"
                  required
                  error={errors.bkashTxnId}
                />
              </div>
            )}

            <Textarea label="Order notes (optional)" name="notes" />
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit lg:sticky lg:top-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Order summary
          </h2>
          <ul className="mb-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2">
                <span className="text-text-secondary">
                  {i.name} ({i.size}) × {i.quantity}
                </span>
                <span className="tabular text-foreground">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mb-4 flex items-end gap-2 border-t border-border pt-3">
            <div className="flex-1">
              <Input
                label="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="SAVE100"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={applyCoupon}
              loading={applyingCoupon}
            >
              Apply
            </Button>
          </div>

          <dl className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="tabular text-foreground">{formatPrice(subtotal)}</dd>
            </div>
            {coupon && (
              <div className="flex justify-between text-accent">
                <dt>Discount ({coupon.code})</dt>
                <dd className="tabular">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-secondary">Delivery</dt>
              <dd className="tabular text-foreground">
                {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="tabular text-primary">{formatPrice(grandTotal)}</dd>
            </div>
          </dl>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            loading={submitting}
            className="mt-5"
          >
            Place order
          </Button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-primary hover:underline"
          >
            Edit cart
          </Link>
        </Card>
      </form>
    </div>
  );
}
