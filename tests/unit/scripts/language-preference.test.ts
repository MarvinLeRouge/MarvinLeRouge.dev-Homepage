// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  initLanguagePreference,
  isHistoryNavigation,
  readPreference,
  redirectTarget,
  savePreference,
  STORAGE_KEY,
  SWITCH_ATTRIBUTE,
  switchedLocale,
} from '../../../src/scripts/language-preference';

const storage = () => localStorage;
const failingStorage = () => ({
  getItem: () => {
    throw new Error('storage disabled');
  },
  setItem: () => {
    throw new Error('storage disabled');
  },
});
const blockedStorage = () => {
  throw new DOMException('site data blocked', 'SecurityError');
};

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('readPreference', () => {
  it('returns the stored locale', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    expect(readPreference(storage)).toBe('en');
  });

  it('returns null when nothing is stored', () => {
    expect(readPreference(storage)).toBeNull();
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'de');
    expect(readPreference(storage)).toBeNull();
  });

  it('returns null when storage throws', () => {
    expect(readPreference(failingStorage)).toBeNull();
  });

  it('returns null when storage cannot even be accessed', () => {
    expect(readPreference(blockedStorage)).toBeNull();
  });
});

describe('savePreference', () => {
  it('stores the locale', () => {
    savePreference(storage, 'fr');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('fr');
  });

  it('does not throw when storage throws', () => {
    expect(() => savePreference(failingStorage, 'en')).not.toThrow();
  });

  it('does not throw when storage cannot even be accessed', () => {
    expect(() => savePreference(blockedStorage, 'en')).not.toThrow();
  });
});

describe('redirectTarget', () => {
  it('sends the French homepage to the English one when English is preferred', () => {
    expect(redirectTarget('/', 'en')).toBe('/en/');
  });

  it('sends the English homepage to the French one when French is preferred', () => {
    expect(redirectTarget('/en/', 'fr')).toBe('/');
  });

  it('stays when the page already matches the preference', () => {
    expect(redirectTarget('/', 'fr')).toBeNull();
    expect(redirectTarget('/en/', 'en')).toBeNull();
  });

  it('stays without a preference', () => {
    expect(redirectTarget('/', null)).toBeNull();
  });

  it('never redirects pages other than the homepages', () => {
    expect(redirectTarget('/projets/jobflow/', 'en')).toBeNull();
    expect(redirectTarget('/en/projects/jobflow/', 'fr')).toBeNull();
    expect(redirectTarget('/en', 'fr')).toBeNull();
  });
});

describe('switchedLocale', () => {
  it('returns the locale of a clicked switcher link, from a nested element', () => {
    document.body.innerHTML = `<a href="/en/" ${SWITCH_ATTRIBUTE}="en"><span>EN</span></a>`;
    expect(switchedLocale(document.querySelector('span'))).toBe('en');
  });

  it('returns null for clicks outside the switcher', () => {
    document.body.innerHTML = '<a href="/">home</a>';
    expect(switchedLocale(document.querySelector('a'))).toBeNull();
  });

  it('returns null for an invalid locale or a non-element target', () => {
    document.body.innerHTML = `<a href="/" ${SWITCH_ATTRIBUTE}="de">DE</a>`;
    expect(switchedLocale(document.querySelector('a'))).toBeNull();
    expect(switchedLocale(null)).toBeNull();
  });
});

describe('isHistoryNavigation', () => {
  const performanceWith = (entries: { type: string }[]) => ({
    getEntriesByType: () => entries as unknown as PerformanceEntryList,
  });

  it('detects back and forward navigations', () => {
    expect(isHistoryNavigation(performanceWith([{ type: 'back_forward' }]))).toBe(true);
  });

  it('treats other navigations, or no timing entry, as regular', () => {
    expect(isHistoryNavigation(performanceWith([{ type: 'navigate' }]))).toBe(false);
    expect(isHistoryNavigation(performanceWith([]))).toBe(false);
  });
});

describe('initLanguagePreference', () => {
  function fakeWindow(pathname: string, navigationType = 'navigate') {
    const replace = vi.fn();
    const win = {
      location: { pathname, search: '?a=1', hash: '#top', replace },
      localStorage,
      document,
      performance: { getEntriesByType: () => [{ type: navigationType }] },
    } as unknown as Window;
    return { win, replace };
  }

  it('redirects to the preferred homepage, keeping query and hash', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    const { win, replace } = fakeWindow('/');

    initLanguagePreference(win);

    expect(replace).toHaveBeenCalledWith('/en/?a=1#top');
  });

  it('does not redirect on back or forward navigation', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    const { win, replace } = fakeWindow('/', 'back_forward');

    initLanguagePreference(win);

    expect(replace).not.toHaveBeenCalled();
  });

  it('keeps working when site data is blocked', () => {
    const { win, replace } = fakeWindow('/');
    Object.defineProperty(win, 'localStorage', {
      get() {
        throw new DOMException('site data blocked', 'SecurityError');
      },
    });
    document.body.innerHTML = `<a href="/en/" ${SWITCH_ATTRIBUTE}="en">EN</a>`;
    const link = document.querySelector('a') as HTMLAnchorElement;
    link.addEventListener('click', (event) => event.preventDefault());

    expect(() => initLanguagePreference(win)).not.toThrow();
    expect(() => link.click()).not.toThrow();
    expect(replace).not.toHaveBeenCalled();
  });

  it('remembers the locale picked with the switcher', () => {
    const { win, replace } = fakeWindow('/');
    document.body.innerHTML = `<a href="/en/" ${SWITCH_ATTRIBUTE}="en">EN</a>`;
    const link = document.querySelector('a') as HTMLAnchorElement;
    link.addEventListener('click', (event) => event.preventDefault());

    initLanguagePreference(win);
    link.click();

    expect(replace).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('ignores clicks elsewhere', () => {
    const { win } = fakeWindow('/');
    document.body.innerHTML = '<button>other</button>';

    initLanguagePreference(win);
    document.querySelector('button')?.click();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
