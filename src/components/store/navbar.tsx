import * as React from "react";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import { LocaleToggle } from "@/components/i18n-provider";
import { BrandLogo } from "@/components/brand-logo";
import { NavSearch } from "@/components/store/nav-search";
import { CartLink } from "@/components/store/cart-link";
import { CategoryStrip } from "@/components/store/category-strip";
import { getT, localized } from "@/i18n/server";

type Category = { slug: string; name: string; nameBn: string | null };

/**
 * Store header.
 *
 * This is a Server Component. It used to be `"use client"` in its entirety,
 * which meant the logo, the account and wishlist links and all four category
 * links were shipped as JavaScript and hydrated on every page load, for no
 * behaviour at all. Only three things here genuinely need the client — search
 * (state + router), the cart badge (localStorage) and the category rail
 * (current URL) — so those are islands and the rest is plain markup.
 *
 * Only the 64px top bar is sticky. The category rail sits outside it and
 * scrolls away; pinning both left ~108px of permanent chrome on a phone.
 */
export async function Navbar({
  loggedIn,
  userName,
  categories,
}: {
  loggedIn: boolean;
  userName: string | null;
  categories: Category[];
}) {
  const { t, locale } = await getT();

  return (
    <>
      {/* Opaque, not `bg-card/95 backdrop-blur`. A blurred backdrop on a
          sticky element is recomposited on every scroll frame — the most
          expensive thing in this header on the low-end Android hardware most
          of our traffic runs on — and at 95% opacity the blur was barely
          visible. Dropping it costs nothing and buys back the scroll budget. */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
          <BrandLogo size={44} priority />

          <NavSearch label={t("nav.search")} />

          <nav aria-label="Account" className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <LocaleToggle />

            <Link
              href="/shop"
              className="hidden min-h-11 items-center px-3 text-base font-medium text-text-secondary transition-colors hover:text-ink sm:flex"
            >
              {t("nav.shop")}
            </Link>

            <Link
              href="/account/wishlist"
              aria-label={t("nav.wishlist")}
              className="flex size-11 items-center justify-center rounded-button hover:bg-muted"
            >
              <Heart className="size-5 text-foreground" />
            </Link>

            <Link
              href={loggedIn ? "/account" : "/account/login"}
              aria-label={t("nav.account")}
              className="flex min-h-11 items-center gap-1.5 rounded-button px-2 hover:bg-muted"
            >
              <User className="size-5 shrink-0 text-foreground" />
              <span className="hidden max-w-24 truncate text-sm text-foreground lg:inline">
                {loggedIn ? userName : t("nav.login")}
              </span>
            </Link>

            <CartLink label={t("nav.cart")} />
          </nav>
        </div>
      </header>

      {/* useSearchParams needs a Suspense boundary so it cannot opt the
          surrounding tree into a client-side bailout during prerender. */}
      <React.Suspense
        fallback={<div className="h-11 border-b border-border bg-background" />}
      >
        <CategoryStrip
          shopLabel={t("nav.shop")}
          items={categories.map((c) => ({
            slug: c.slug,
            label: localized(c, "name", "nameBn", locale),
          }))}
        />
      </React.Suspense>
    </>
  );
}
