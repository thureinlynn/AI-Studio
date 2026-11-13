export type CookieConsentChoice = 'accepted' | 'declined';

export const COOKIE_CONSENT_STORAGE_KEY = 'luukyone_cookie_consent_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return null;
}

export function getStoredCookieConsent(
  storage: StorageLike | null = getDefaultStorage()
): CookieConsentChoice | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === 'accepted' || raw === 'declined') {
      return raw;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

export function saveCookieConsent(
  choice: CookieConsentChoice,
  storage: StorageLike | null = getDefaultStorage()
): CookieConsentChoice {
  if (storage) {
    try {
      storage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ignore storage write errors
    }
  }
  return choice;
}

export function shouldShowCookieBanner(
  storage: StorageLike | null = getDefaultStorage()
): boolean {
  return getStoredCookieConsent(storage) === null;
}

export function isAnalyticsConsented(
  storage: StorageLike | null = getDefaultStorage()
): boolean {
  return getStoredCookieConsent(storage) === 'accepted';
}
