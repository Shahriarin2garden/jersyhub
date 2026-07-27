import type { Metadata } from "next";
import { DM_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/server";

// One minimal, premium sans across the whole UI — headings, body, wordmark.
// Hierarchy comes from weight and tracking, not from mixing families. DM Sans
// stays crisp at every size (the thin serif read poorly at hero and card sizes).
const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Bangla is the DEFAULT locale, so its face is first-class, not a fallback.
// Hind Siliguri is the Bengali sans counterpart to DM Sans — modern, minimal.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexVive — Style that defines you",
    template: "%s · NexVive",
  },
  description:
    "Authentic football, cricket & basketball jerseys. Cash on delivery across Bangladesh.",
  icons: { icon: "/assets/logos/nexvive-logo.jpg" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${hindSiliguri.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
