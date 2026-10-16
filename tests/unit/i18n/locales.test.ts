import { describe, expect, it } from 'vitest';
import { HOME_PATHS, homePath, isLocale, LOCALES, OG_LOCALES } from '../../../src/i18n/locales';

describe('locales', () => {
  it('serves the default locale at the root and the others under their prefix', () => {
    expect(homePath('fr')).toBe('/');
    expect(homePath('en')).toBe('/en/');
    expect(HOME_PATHS).toEqual({ fr: '/', en: '/en/' });
  });

  it('accepts only supported locale codes', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });

  it('maps every locale to an Open Graph locale code', () => {
    for (const locale of LOCALES) expect(OG_LOCALES[locale]).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
  });
});
