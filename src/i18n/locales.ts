/** Supported locales. French is the default and is served at the site root. */
export const LOCALES = ['fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

/** Open Graph locale code (language and territory) per locale. */
export const OG_LOCALES: Readonly<Record<Locale, string>> = { fr: 'fr_FR', en: 'en_US' };

/** Type guard for values read from untrusted sources (storage, URLs). */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Path of the homepage for a locale: `/` for the default locale, `/<locale>/` otherwise. */
export function homePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}

/** Homepage path per locale. */
export const HOME_PATHS: Readonly<Record<Locale, string>> = Object.fromEntries(
  LOCALES.map((locale) => [locale, homePath(locale)]),
) as Record<Locale, string>;
