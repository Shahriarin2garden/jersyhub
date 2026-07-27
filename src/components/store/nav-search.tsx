"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Catalogue search. A client island rather than part of the header itself:
 * it is the only piece of the top bar that needs state and a router, so
 * isolating it keeps the logo, the static links and the category strip out of
 * the client bundle and out of hydration.
 *
 * The field is rendered twice — inline on desktop, and as its own collapsible
 * row on mobile. Search is a primary path into the catalogue, so it cannot be
 * desktop-only; but left permanently expanded on a phone it pushes the sticky
 * header past 150px, which is a sixth of the viewport gone before any content.
 */
export function NavSearch({ label }: { label: string }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const mobileRef = React.useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    setOpen(false);
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  const field = (ref?: React.Ref<HTMLInputElement>) => (
    <>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <input
        ref={ref}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-11 w-full rounded-button border border-border bg-background pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ink"
      />
    </>
  );

  return (
    <>
      <form onSubmit={submit} className="relative hidden flex-1 md:block">
        {field()}
      </form>

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          // Focus after paint, so opening the row puts the keyboard straight
          // into the field instead of costing a second tap.
          requestAnimationFrame(() => mobileRef.current?.focus());
        }}
        aria-label={label}
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-button hover:bg-muted md:hidden"
      >
        <Search className="size-5 text-foreground" />
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="absolute inset-x-0 top-full border-t border-border bg-card px-4 py-2 md:hidden"
        >
          <div className="relative">{field(mobileRef)}</div>
        </form>
      )}
    </>
  );
}
