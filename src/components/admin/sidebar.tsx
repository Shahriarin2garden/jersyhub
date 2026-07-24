"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Star,
  Shirt,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-muted",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const inner = (
    <div className="flex h-full flex-col p-4">
      <Link href="/admin/dashboard" className="mb-6 flex items-center gap-2 px-1">
        <Shirt className="size-6 text-primary" />
        <span className="font-display text-xl font-bold uppercase text-foreground">
          JersyHub
        </span>
      </Link>
      {nav}
      <button
        onClick={() => signOut({ callbackUrl: "/admin" })}
        className="mt-2 flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-destructive-light hover:text-destructive"
      >
        <LogOut className="size-5" /> Sign out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-6 text-foreground" />
        </button>
        <span className="font-display text-lg font-bold uppercase text-foreground">
          JersyHub Admin
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-card">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 text-text-muted"
            >
              <X className="size-5" />
            </button>
            {inner}
          </div>
        </div>
      )}
    </>
  );
}
