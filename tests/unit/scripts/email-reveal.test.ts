// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import {
  decodeEmail,
  EMAIL_ATTRIBUTE,
  encodeEmail,
  revealEmails,
  spellOutEmail,
} from '../../../src/scripts/email-reveal';

const ADDRESS = 'someone@example.org';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('encodeEmail', () => {
  it('does not leave the address readable', () => {
    const encoded = encodeEmail(ADDRESS);
    expect(encoded).not.toContain('@');
    expect(encoded).not.toContain('example');
  });
});

describe('decodeEmail', () => {
  it('restores an encoded address', () => {
    expect(decodeEmail(encodeEmail(ADDRESS))).toBe(ADDRESS);
  });

  it('returns null for invalid base64', () => {
    expect(decodeEmail('not base64 !')).toBeNull();
  });

  it('returns null when the decoded value is not an address', () => {
    expect(decodeEmail(btoa('plain text'))).toBeNull();
  });
});

describe('spellOutEmail', () => {
  it('spells out the separators with the given words', () => {
    expect(spellOutEmail('contact@my-site.example.dev', { at: 'arobase', dot: 'point' })).toBe(
      'contact (arobase) my-site (point) example (point) dev',
    );
  });
});

describe('revealEmails', () => {
  it('replaces each placeholder with a mailto link showing the address', () => {
    document.body.innerHTML = `<p><span class="email" ${EMAIL_ATTRIBUTE}="${encodeEmail(ADDRESS)}">someone (at) example (dot) org</span></p>`;

    revealEmails(document);

    const link = document.querySelector('a');
    expect(link?.getAttribute('href')).toBe(`mailto:${ADDRESS}`);
    expect(link?.textContent).toBe(ADDRESS);
    expect(link?.className).toBe('email');
    expect(document.querySelector(`[${EMAIL_ATTRIBUTE}]`)).toBeNull();
  });

  it('reveals every placeholder of the document', () => {
    const other = 'other@example.org';
    document.body.innerHTML = `<span ${EMAIL_ATTRIBUTE}="${encodeEmail(ADDRESS)}"></span><span ${EMAIL_ATTRIBUTE}="${encodeEmail(other)}"></span>`;

    revealEmails(document);

    const hrefs = [...document.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual([`mailto:${ADDRESS}`, `mailto:${other}`]);
  });

  it('leaves a placeholder with an empty value untouched', () => {
    document.body.innerHTML = `<span ${EMAIL_ATTRIBUTE}="">fallback</span>`;

    revealEmails(document);

    expect(document.querySelector('a')).toBeNull();
  });

  it('leaves a placeholder with an undecodable value untouched', () => {
    document.body.innerHTML = `<span ${EMAIL_ATTRIBUTE}="broken">fallback</span>`;

    revealEmails(document);

    expect(document.querySelector('a')).toBeNull();
    expect(document.body.textContent).toBe('fallback');
  });
});
