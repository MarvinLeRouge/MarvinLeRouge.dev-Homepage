import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../../src/i18n/locales';
import { UI } from '../../../src/i18n/ui';

/** Every string of a value, nested objects and rich text segments included. */
function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (typeof value === 'object' && value !== null)
    return Object.values(value).flatMap(collectStrings);
  return [];
}

// Writing rules of the site: no em dash, straight quotes and apostrophes only.
const FORBIDDEN = [
  { name: 'em dash', pattern: /—/ },
  { name: 'curly quote or apostrophe', pattern: /[‘’“”]/ },
];

describe.each(LOCALES)('UI strings (%s)', (locale) => {
  const strings = collectStrings(UI[locale]);

  it('reaches the strings nested in rich text', () => {
    const emphasis = UI[locale].home.pitch.flatMap((part) =>
      typeof part === 'string' ? [] : Object.values(part),
    );
    expect(emphasis.length).toBeGreaterThan(0);
    expect(strings).toEqual(expect.arrayContaining(emphasis));
  });

  it('has no empty string', () => {
    expect(strings.filter((text) => text.trim() === '')).toEqual([]);
  });

  it.each(FORBIDDEN)('has no $name', ({ pattern }) => {
    expect(strings.filter((text) => pattern.test(text))).toEqual([]);
  });
});
