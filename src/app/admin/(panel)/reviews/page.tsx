import { Star } from "lucide-react";
import type { Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewActions } from "@/components/admin/review-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const STATUS_TABS: (ReviewStatus | "ALL")[] = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default async function ReviewsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = (str(sp.status) as ReviewStatus | "ALL") ?? "PENDING";

  const where: Prisma.ReviewWhereInput =
    status === "ALL" ? {} : { status: status as ReviewStatus };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/reviews?status=${s}`}
            className={cn(
              "rounded-badge px-3 py-1.5 text-sm font-medium capitalize",
              status === s
                ? "bg-primary text-white"
                : "bg-muted text-text-secondary hover:bg-primary-light",
            )}
          >
            {s.toLowerCase()}
          </Link>
        ))}
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-card border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size={14} />
                  <span className="font-medium text-foreground">{r.customer.name}</span>
                  <span className="text-sm text-text-muted">on {r.product.name}</span>
                </div>
                <Badge
                  className={cn(
                    r.status === "APPROVED" && "bg-accent-light text-primary-dark",
                    r.status === "PENDING" && "bg-status-pending-bg text-status-pending-text",
                    r.status === "REJECTED" && "bg-destructive-light text-destructive",
                  )}
                >
                  {r.status.toLowerCase()}
                </Badge>
              </div>
              {r.title && <p className="mt-2 font-medium text-foreground">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm text-text-secondary">{r.comment}</p>}
              <div className="mt-3">
                <ReviewActions reviewId={r.id} status={r.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Star} title="No reviews" description="Nothing to moderate here." />
      )}
    </div>
  );
}
