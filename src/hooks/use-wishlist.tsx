"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Ctx = {
  loggedIn: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  count: number;
};

const WishlistContext = React.createContext<Ctx | null>(null);

export function WishlistProvider({
  loggedIn,
  initialIds,
  children,
}: {
  loggedIn: boolean;
  initialIds: string[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ids, setIds] = React.useState<Set<string>>(new Set(initialIds));

  const toggle = React.useCallback(
    async (productId: string) => {
      if (!loggedIn) {
        router.push("/account/login");
        return;
      }
      // Optimistic update.
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } catch {
        // Revert on failure.
        setIds((prev) => {
          const next = new Set(prev);
          if (next.has(productId)) next.delete(productId);
          else next.add(productId);
          return next;
        });
      }
    },
    [loggedIn, router],
  );

  const value: Ctx = {
    loggedIn,
    has: (id) => ids.has(id),
    toggle,
    count: ids.size,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
