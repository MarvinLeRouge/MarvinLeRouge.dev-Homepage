import { describe, expect, it } from 'vitest';
import { HOME_PATHS, homePath, isLocale } from '../../../src/i18n/locales';

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
});
