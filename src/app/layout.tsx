import type { Metadata } from "next";
import { Montserrat, Cormorant, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/server";

// Body — geometric sans, echoes the wide NexVive wordmark.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Display — elegant high-contrast serif, the luxury-fashion voice.
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Bangla is the default locale; Barlow has no Bengali glyphs, so without this
// the browser falls back to whatever it has and the metrics stop matching.
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
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
      className={`${montserrat.variable} ${cormorant.variable} ${notoBengali.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
