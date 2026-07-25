"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function CouponForm() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = React.useState(false);
  const [type, setType] = React.useState<"PERCENT" | "FIXED">("PERCENT");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = fd.get(k);
      return v ? Number(v) : undefined;
    };
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: String(fd.get("code") ?? ""),
          type,
          value: num("value") ?? 0,
          minSubtotal: num("minSubtotal") ?? 0,
          maxDiscount: num("maxDiscount") ?? null,
          usageLimit: num("usageLimit") ?? null,
          active: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Failed to create coupon", "error");
        return;
      }
      toast("Coupon created", "success");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-foreground">New coupon</h2>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Code" name="code" required placeholder="SAVE100" />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
        >
          <option value="PERCENT">Percent (%)</option>
          <option value="FIXED">Fixed (৳)</option>
        </Select>
        <Input
          label={type === "PERCENT" ? "Value (%)" : "Value (৳)"}
          name="value"
          type="number"
          min={0}
          required
        />
        <Input label="Min subtotal (৳)" name="minSubtotal" type="number" min={0} />
        <Input label="Max discount (৳)" name="maxDiscount" type="number" min={0} />
        <Input label="Usage limit" name="usageLimit" type="number" min={1} />
        <div className="sm:col-span-2 lg:col-span-3">
          <Button type="submit" loading={saving}>
            <Plus className="size-4" /> Create coupon
          </Button>
        </div>
      </form>
    </Card>
  );
}
