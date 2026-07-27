import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached reads for catalogue data that every visitor triggers but almost nobody
 * changes.
 *
 * Why here and not page-level ISR: the locale is read from a cookie in
 * `getT()`, which forces every page to render dynamically no matter what
 * `revalidate` is set to. The render itself is cheap; the database round trips
 * are not. Caching the queries gets the saving that full-page ISR would have,
 * without giving up cookie-based i18n.
 *
 * This matters on the deployed free tier: Neon bills compute time and suspends
 * when idle, so it is the tightest limit we have. Fewer queries means less
 * compute burned and a database that stays asleep more of the day.
 *
 * Staleness: catalogue edits made in the admin panel appear within the
 * revalidate window below. Tags are attached so a mutation can call
 * `revalidateTag` to publish instantly instead of waiting.
 */

const FIVE_MINUTES = 300;

/**
 * Drop cached catalogue reads after an admin write, so an edit is live on the
 * storefront immediately instead of after the revalidate window.
 *
 * `{ expire: 0 }` rather than the usual `"max"` profile: these are called from
 * Route Handlers, and an admin who just saved a product expects to see it on
 * the next page load, not stale-while-revalidate.
 */
export function revalidateCatalogue() {
  revalidateTag("products", { expire: 0 });
  revalidateTag("categories", { expire: 0 });
}

/** Drop cached review reads after moderating a review. */
export function revalidateReviews() {
  revalidateTag("reviews", { expire: 0 });
}

/** Navbar categories — read on every store page render, edited rarely. */
export const getNavCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { slug: true, name: true, nameBn: true },
    }),
  ["nav-categories"],
  { revalidate: FIVE_MINUTES, tags: ["categories"] },
);

/** Category list + counts for the landing page bento. */
export const getLandingCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ["landing-categories"],
  { revalidate: FIVE_MINUTES, tags: ["categories", "products"] },
);

/** Featured products for the landing grid. */
export const getFeaturedProducts = unstable_cache(
  () =>
    prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: { category: { select: { name: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ["featured-products"],
  { revalidate: FIVE_MINUTES, tags: ["products"] },
);

/** Approved 4-star-plus reviews shown as social proof on the landing page. */
export const getLandingReviews = unstable_cache(
  () =>
    prisma.review.findMany({
      where: { status: "APPROVED", rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        customer: { select: { name: true } },
        product: { select: { name: true, nameBn: true, slug: true } },
      },
    }),
  ["landing-reviews"],
  { revalidate: FIVE_MINUTES, tags: ["reviews"] },
);

/**
 * Aggregate rating across every approved review.
 *
 * The landing page displayed a hard-coded "4.9 / 5" next to the hero image.
 * On a shop that takes real money that is a fabricated claim, so the figure now
 * comes from the reviews table — and the chip is hidden entirely until there
 * are reviews to average.
 */
export const getReviewStats = unstable_cache(
  async () => {
    const { _avg, _count } = await prisma.review.aggregate({
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });
    return { average: _avg.rating ?? 0, count: _count };
  },
  ["review-stats"],
  { revalidate: FIVE_MINUTES, tags: ["reviews"] },
);

/** Category options for the shop filter sidebar. */
export const getFilterCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ["filter-categories"],
  { revalidate: FIVE_MINUTES, tags: ["categories"] },
);
