/** Attribute holding an encoded address, on the element the address replaces once revealed. */
export const EMAIL_ATTRIBUTE = 'data-email';

/** Words standing for the address separators in the spelled-out form. */
export interface SpelledOutWords {
  readonly at: string;
  readonly dot: string;
}

const reverse = (value: string) => [...value].reverse().join('');

/**
 * Reversed then base64-encoded: unreadable by crawlers scanning the HTML or the public repository.
 * Addresses are ASCII, which `btoa` requires.
 */
export function encodeEmail(address: string): string {
  return btoa(reverse(address));
}

/** Address encoded by `encodeEmail`, or null when the value is not a valid encoded address. */
export function decodeEmail(encoded: string): string | null {
  try {
    const address = reverse(atob(encoded));
    return address.includes('@') ? address : null;
  } catch {
    return null;
  }
}

/** Human-readable but not harvestable form, shown when JavaScript is off. */
export function spellOutEmail(address: string, { at, dot }: SpelledOutWords): string {
  return address.replace('@', ` (${at}) `).replaceAll('.', ` (${dot}) `);
}

/** Replaces every encoded address placeholder with a mailto link showing the address. */
export function revealEmails(root: ParentNode): void {
  for (const placeholder of root.querySelectorAll<HTMLElement>(`[${EMAIL_ATTRIBUTE}]`)) {
    const address = decodeEmail(placeholder.getAttribute(EMAIL_ATTRIBUTE) ?? '');
    if (address === null) continue;
    const link = placeholder.ownerDocument.createElement('a');
    link.href = `mailto:${address}`;
    link.textContent = address;
    link.className = placeholder.className;
    placeholder.replaceWith(link);
  }
}
