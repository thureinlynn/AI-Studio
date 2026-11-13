import test from 'node:test';
import assert from 'node:assert/strict';
import { isStandalonePWA, isIOSDevice } from './pwaUtils';

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
