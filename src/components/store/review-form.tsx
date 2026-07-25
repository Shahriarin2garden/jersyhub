"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarInput } from "@/components/ui/star-rating";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";

export function ReviewForm({
  productId,
  loggedIn,
}: {
  productId: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const [rating, setRating] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  if (!loggedIn) {
    return (
      <p className="text-sm text-text-muted">
        <Link href="/account/login" className="text-primary hover:underline">
          {t("nav.login")}
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast("Please select a rating", "error");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: String(fd.get("title") ?? "") || undefined,
          comment: String(fd.get("comment") ?? "") || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Could not submit review", "error");
        return;
      }
      toast("Review submitted — pending approval", "success");
      (e.target as HTMLFormElement).reset();
      setRating(0);
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-card border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">{t("review.write")}</p>
      <StarInput value={rating} onChange={setRating} />
      <Input name="title" placeholder="Title (optional)" />
      <Textarea name="comment" placeholder="Share your experience…" />
      <Button type="submit" loading={saving}>
        {t("review.submit")}
      </Button>
    </form>
  );
}
