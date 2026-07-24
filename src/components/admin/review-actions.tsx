"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ReviewActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  async function set(next: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast("Update failed", "error");
        return;
      }
      toast(`Review ${next.toLowerCase()}`, "success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status !== "APPROVED" && (
        <Button size="sm" variant="accent" onClick={() => set("APPROVED")} loading={loading}>
          <Check className="size-4" /> Approve
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button size="sm" variant="destructive" onClick={() => set("REJECTED")} loading={loading}>
          <X className="size-4" /> Reject
        </Button>
      )}
    </div>
  );
}
