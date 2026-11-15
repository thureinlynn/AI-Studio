import test from 'node:test';
import assert from 'node:assert/strict';
import { isBrowserOffline, isTransientFirestoreError } from './firebaseUtils';

test('isBrowserOffline detects explicit offline status safely', () => {
  assert.equal(isBrowserOffline({ onLine: false }), true);
  assert.equal(isBrowserOffline({ onLine: true }), false);
  assert.equal(isBrowserOffline({}), false);
  assert.equal(isBrowserOffline(null), false);
});

test('isTransientFirestoreError identifies unavailable and offline errors without swallowing permission errors', () => {
  assert.equal(
    isTransientFirestoreError({ code: 'unavailable', message: 'The operation could not be completed' }),
    true
  );
  assert.equal(
    isTransientFirestoreError({ code: 'failed-precondition', message: 'Failed to get document because the client is offline.' }),
    true
  );
  assert.equal(
    isTransientFirestoreError({ code: 'permission-denied', message: 'Missing or insufficient permissions.' }),
    false
  );
  assert.equal(isTransientFirestoreError(null), false);
});
