import { homePath, isLocale, LOCALES, type Locale } from '../i18n/locales';

/** localStorage key holding the language the visitor picked with the switcher. */
export const STORAGE_KEY = 'preferred-locale';

/** Attribute set on the switcher links, holding the locale they lead to. */
export const SWITCH_ATTRIBUTE = 'data-locale-switch';

/**
 * Lazy access to storage: with site data blocked, merely reading `window.localStorage` throws,
 * so the access itself must happen inside the try blocks below.
 */
export type StorageAccessor = () => Pick<Storage, 'getItem' | 'setItem'>;

/** Reads the stored preference. Returns null when nothing valid is stored or storage is unavailable. */
export function readPreference(storage: StorageAccessor): Locale | null {
  try {
    const value = storage().getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/** Stores the preference. Silently does nothing when storage is unavailable. */
export function savePreference(storage: StorageAccessor, locale: Locale): void {
  try {
    storage().setItem(STORAGE_KEY, locale);
  } catch {
    // The choice simply is not remembered.
  }
}

/**
 * Where a visitor landing on `pathname` should be sent, given their stored preference.
 * Only homepages redirect: a direct link to any other page keeps the language of its URL.
 */
export function redirectTarget(pathname: string, preferred: Locale | null): string | null {
  if (preferred === null) return null;
  const isHomepage = LOCALES.some((locale) => homePath(locale) === pathname);
  const target = homePath(preferred);
  return isHomepage && pathname !== target ? target : null;
}

/** Locale targeted by a click, if it hit a language switcher link. */
export function switchedLocale(target: EventTarget | null): Locale | null {
  if (!(target instanceof Element)) return null;
  const value = target.closest(`[${SWITCH_ATTRIBUTE}]`)?.getAttribute(SWITCH_ATTRIBUTE);
  return isLocale(value) ? value : null;
}

/** True when the page was reached with the browser's back or forward button. */
export function isHistoryNavigation(performance: Pick<Performance, 'getEntriesByType'>): boolean {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return entry?.type === 'back_forward';
}

/**
 * Applies the stored preference to the current page, then remembers any later switcher click.
 * Meant to run as a blocking script in the document head, before the first paint.
 * Back and forward navigations are left alone, so the visitor can always return to a page.
 */
export function initLanguagePreference(win: Window): void {
  const storage: StorageAccessor = () => win.localStorage;
  if (!isHistoryNavigation(win.performance)) {
    const target = redirectTarget(win.location.pathname, readPreference(storage));
    if (target !== null) {
      win.location.replace(target + win.location.search + win.location.hash);
      return;
    }
  }
  win.document.addEventListener('click', (event) => {
    const locale = switchedLocale(event.target);
    if (locale !== null) savePreference(storage, locale);
  });
}
