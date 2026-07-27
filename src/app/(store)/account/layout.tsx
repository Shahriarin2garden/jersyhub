import Link from "next/link";
import { User, Package, Heart } from "lucide-react";
import { requireCustomer } from "@/lib/guard";
import { LogoutButton } from "@/components/store/logout-button";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomer();
  // Login page renders its own tree; proxy already guards, but layout wraps all
  // /account routes including /account/login — so allow when unauthenticated.
  if (!session) {
    return <>{children}</>;
  }

  const links = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "My orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-card border border-border bg-card p-3">
          <p className="px-3 py-2 text-sm text-text-muted">
            {session.user.name}
          </p>
          <nav className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-11 items-center gap-2 rounded-button px-3 text-sm font-medium text-text-secondary hover:bg-muted"
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 border-t border-border pt-2">
            <LogoutButton />
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
