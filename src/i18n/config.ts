export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "bn";
export const LOCALE_COOKIE = "jersyhub_locale";

export function isLocale(v: string | undefined): v is Locale {
  return v === "bn" || v === "en";
}
