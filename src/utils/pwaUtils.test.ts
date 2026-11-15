import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PWA_PROMPT_DISMISSED_KEY,
  isStandalonePWA,
  isIOSDevice,
  isMobileDevice,
  hasDismissedPWAPrompt,
  markPWAPromptDismissed,
  shouldShowMobileInstallAlert,
} from './pwaUtils';

test('isStandalonePWA detects display-mode standalone, fullscreen, and iOS navigator.standalone', () => {
  assert.equal(
    isStandalonePWA((q) => ({ matches: q === '(display-mode: standalone)' }), {}),
    true
  );
  assert.equal(
    isStandalonePWA((q) => ({ matches: q === '(display-mode: fullscreen)' }), {}),
    true
  );
  assert.equal(isStandalonePWA(() => ({ matches: false }), { standalone: true }), true);
  assert.equal(isStandalonePWA(() => ({ matches: false }), { standalone: false }), false);
});

test('isIOSDevice detects iPhone, iPad, and iPadOS desktop-mode touch devices', () => {
  assert.equal(
    isIOSDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' }),
    true
  );
  assert.equal(
    isIOSDevice({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel', maxTouchPoints: 5 }),
    true
  );
  assert.equal(
    isIOSDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)', platform: 'Linux armv8l', maxTouchPoints: 5 }),
    false
  );
});

test('isMobileDevice detects mobile user agents and narrow mobile viewports', () => {
  assert.equal(
    isMobileDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' }, 1440),
    true
  );
  assert.equal(
    isMobileDevice({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }, 390),
    true
  );
  assert.equal(
    isMobileDevice({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }, 1440),
    false
  );
});

test('hasDismissedPWAPrompt and markPWAPromptDismissed persist state safely', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  };

  assert.equal(hasDismissedPWAPrompt(mockStorage), false);
  markPWAPromptDismissed(mockStorage, '2026-11-15T00:00:00Z');
  assert.equal(store.get(PWA_PROMPT_DISMISSED_KEY), '2026-11-15T00:00:00Z');
  assert.equal(hasDismissedPWAPrompt(mockStorage), true);
});

test('shouldShowMobileInstallAlert shows only on non-installed, non-dismissed mobile visits', () => {
  assert.equal(
    shouldShowMobileInstallAlert({ isMobile: true, isInstalled: false, isDismissed: false }),
    true
  );
  assert.equal(
    shouldShowMobileInstallAlert({ isMobile: true, isInstalled: true, isDismissed: false }),
    false
  );
  assert.equal(
    shouldShowMobileInstallAlert({ isMobile: true, isInstalled: false, isDismissed: true }),
    false
  );
  assert.equal(
    shouldShowMobileInstallAlert({ isMobile: false, isInstalled: false, isDismissed: false }),
    false
  );
});

