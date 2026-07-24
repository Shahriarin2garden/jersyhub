import Link from "next/link";
import { Phone, MapPin, MessageCircle } from "lucide-react";
import { BUSINESS, whatsappLink } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-16 bg-primary-dark text-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            {BUSINESS.name}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Premium jerseys at local prices. Authentic quality, cash on delivery.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="size-4" /> {BUSINESS.address}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4" /> {BUSINESS.phone}
          </p>
          <a
            href={whatsappLink("Hi JersyHub, I have a question.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <MessageCircle className="size-4" /> WhatsApp us
          </a>
        </div>
        <div className="space-y-2 text-sm">
          <Link href="/shop" className="block hover:text-white">
            Shop all jerseys
          </Link>
          <Link href="/cart" className="block hover:text-white">
            Your cart
          </Link>
          <Link href="/admin" className="block text-white/50 hover:text-white">
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
