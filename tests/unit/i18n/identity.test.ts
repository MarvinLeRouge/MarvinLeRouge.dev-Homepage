import { describe, expect, it } from 'vitest';
import {
  CIVIL_NAME,
  ENCODED_EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  PSEUDONYM,
  SITE_NAME,
} from '../../../src/i18n/identity';
import { decodeEmail } from '../../../src/scripts/email-reveal';

describe('identity', () => {
  it('encodes a contact address on the site domain', () => {
    expect(decodeEmail(ENCODED_EMAIL)).toMatch(/^[^@\s]+@marvinlerouge\.dev$/);
  });

  it.each([GITHUB_URL, LINKEDIN_URL])('links to %s over https', (url) => {
    expect(new URL(url).protocol).toBe('https:');
  });

  it('names the site after the pseudonym', () => {
    expect(SITE_NAME.toLowerCase()).toBe(`${PSEUDONYM.toLowerCase()}.dev`);
  });

  it('has a civil name', () => {
    expect(CIVIL_NAME.trim()).not.toBe('');
  });
});
