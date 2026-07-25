"use client";

import { CartProvider } from "@/hooks/use-cart";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/components/i18n-provider";
import type { Locale } from "@/i18n/config";

export function Providers({
  locale,
  loggedIn = false,
  wishlistIds = [],
  children,
}: {
  locale: Locale;
  loggedIn?: boolean;
  wishlistIds?: string[];
  children: React.ReactNode;
}) {
  return (
    <I18nProvider locale={locale}>
      <ToastProvider>
        <WishlistProvider loggedIn={loggedIn} initialIds={wishlistIds}>
          <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
