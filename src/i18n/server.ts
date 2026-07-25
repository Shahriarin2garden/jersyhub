import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getDictionary, type TranslationKey } from "./dictionaries";

/** Read the active locale from the cookie (server components). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Server-side translator. */
export async function getT() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = (key: TranslationKey) => dict[key] ?? key;
  return { t, locale };
}

/** Pick a localized field: bn falls back to base when empty. */
export function localized<T extends { [k: string]: unknown }>(
  row: T,
  base: keyof T,
  bnField: keyof T,
  locale: Locale,
): string {
  if (locale === "bn") {
    const bn = row[bnField];
    if (typeof bn === "string" && bn.trim()) return bn;
  }
  return String(row[base] ?? "");
}
