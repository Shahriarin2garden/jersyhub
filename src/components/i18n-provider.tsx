"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { getDictionary, type TranslationKey } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Ctx = {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (l: Locale) => void;
};

const I18nContext = React.createContext<Ctx | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = React.useState<Locale>(locale ?? DEFAULT_LOCALE);
  const dict = getDictionary(current);

  const setLocale = React.useCallback(
    (l: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      setCurrent(l);
      router.refresh(); // re-render server components with new locale
    },
    [router],
  );

  const value: Ctx = {
    locale: current,
    t: (key) => dict[key] ?? key,
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Bangla ⇄ English toggle button. */
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-button px-2.5 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label="Switch language"
    >
      <Languages className="size-4" />
      {locale === "bn" ? "EN" : "বাং"}
    </button>
  );
}
