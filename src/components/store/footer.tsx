import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { BUSINESS, whatsappLink } from "@/lib/constants";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer className="mt-16 bg-primary-dark text-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-3">
        <div>
          <BrandLogo size={104} href={null} className="shadow-none" />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Authentic quality, cash on delivery across Bangladesh.
          </p>
        </div>
        <div className="space-y-2.5 text-sm text-white/75">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" /> {BUSINESS.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-accent" /> {BUSINESS.phone}
          </p>
          <a
            href={whatsappLink("Hi NexVive, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 transition-colors hover:text-white"
          >
            <MessageCircle className="size-4 text-accent" /> WhatsApp us
          </a>
        </div>
        {/* Footer links sit close together, so each needs a full-height row to
            be tappable without hitting its neighbour. */}
        <div className="text-sm text-white/75">
          <Link href="/shop" className="flex min-h-11 items-center transition-colors hover:text-white">
            Shop all
          </Link>
          <Link href="/cart" className="flex min-h-11 items-center transition-colors hover:text-white">
            Your cart
          </Link>
          <Link href="/account" className="flex min-h-11 items-center transition-colors hover:text-white">
            My account
          </Link>
          <Link
            href="/admin"
            className="flex min-h-11 items-center text-white/40 transition-colors hover:text-white"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs uppercase tracking-widest text-white/50">
        © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
