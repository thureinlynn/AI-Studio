import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getStoredCookieConsent,
  saveCookieConsent,
  shouldShowCookieBanner,
  isAnalyticsConsented,
  StorageLike,
} from './cookieConsentUtils';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

test('shouldShowCookieBanner returns true when no choice has been stored', () => {
  const storage = createMemoryStorage();
  assert.equal(getStoredCookieConsent(storage), null);
  assert.equal(shouldShowCookieBanner(storage), true);
  assert.equal(isAnalyticsConsented(storage), false);
});

test('saveCookieConsent stores accepted choice and hides banner', () => {
  const storage = createMemoryStorage();
  saveCookieConsent('accepted', storage);
  assert.equal(getStoredCookieConsent(storage), 'accepted');
  assert.equal(shouldShowCookieBanner(storage), false);
  assert.equal(isAnalyticsConsented(storage), true);
});

test('saveCookieConsent stores declined choice, hides banner, and keeps analytics disabled', () => {
  const storage = createMemoryStorage();
  saveCookieConsent('declined', storage);
  assert.equal(getStoredCookieConsent(storage), 'declined');
  assert.equal(shouldShowCookieBanner(storage), false);
  assert.equal(isAnalyticsConsented(storage), false);
});

test('getStoredCookieConsent ignores unrecognized values safely', () => {
  const storage = createMemoryStorage();
  storage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'unknown-value');
  assert.equal(getStoredCookieConsent(storage), null);
  assert.equal(shouldShowCookieBanner(storage), true);
});
