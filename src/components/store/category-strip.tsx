"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type StripItem = { slug: string; label: string };

/**
 * Category rail under the top bar.
 *
 * Client-only for one reason: the active item. A server component cannot read
 * the current URL, and marking the visitor's location is the difference
 * between a nav bar and a row of links — so this stays an island, while the
 * logo, account links and search button render on the server.
 *
 * Deliberately NOT inside the sticky header. The top bar is 64px; adding this
 * rail to it pinned ~108px — a sixth of a phone viewport — for the whole
 * session. Category browsing is discovery, not something a shopper needs
 * within reach at every scroll position, so the rail scrolls away and the
 * 64px bar stays.
 */
export function CategoryStrip({
  items,
  shopLabel,
}: {
  items: StripItem[];
  shopLabel: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("category");
  const onShop = pathname === "/shop";

  const link = (href: string, label: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 transition-colors",
        isActive
          ? "font-semibold text-foreground"
          : "text-text-secondary hover:text-ink",
      )}
    >
      {label}
      {/* Underline rather than a colour swap alone: colour is not allowed to
          be the only carrier of state. */}
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
        />
      )}
    </Link>
  );

  return (
    // The rail scrolls in its own container so the page body never gains a
    // horizontal scrollbar; `scroll-fade` hints that there is more to the
    // right, which a plain overflow container gives no sign of.
    <nav aria-label={shopLabel} className="border-b border-border bg-background">
      <div className="scroll-fade mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 text-sm">
        {link("/shop", shopLabel, onShop && !active)}
        {items.map((c) => link(`/shop?category=${c.slug}`, c.label, active === c.slug))}
      </div>
    </nav>
  );
}
