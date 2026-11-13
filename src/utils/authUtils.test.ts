import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapGoogleAuthError,
  pickFirebasePhotoUrl,
  buildResolvedUserProfile,
} from './authUtils.ts';

test('mapGoogleAuthError handles unauthorized-domain with hostname context', () => {
  const msg = mapGoogleAuthError({ code: 'auth/unauthorized-domain' }, 'luukyone.astronerd.me');
  assert.match(msg, /luukyone\.astronerd\.me/);
  assert.match(msg, /luukyone-b17b7/);
  assert.match(msg, /Authorized domains/);
});

test('mapGoogleAuthError handles popup, credential, provider disabled, and network errors cleanly', () => {
  assert.match(mapGoogleAuthError({ code: 'auth/popup-blocked' }), /allow popups/i);
  assert.match(mapGoogleAuthError({ code: 'auth/popup-closed-by-user' }), /closed before completing/i);
  assert.match(mapGoogleAuthError({ code: 'auth/cancelled-popup-request' }), /Another sign-in window/i);
  assert.match(mapGoogleAuthError({ code: 'auth/operation-not-allowed' }), /enable "Google"/i);
  assert.match(mapGoogleAuthError({ code: 'auth/configuration-not-found' }), /enable "Google"/i);
  assert.match(
    mapGoogleAuthError({ code: 'auth/account-exists-with-different-credential' }),
    /different sign-in method/i
  );
  assert.match(mapGoogleAuthError({ code: 'auth/network-request-failed' }), /Network error/i);
  assert.match(mapGoogleAuthError({ code: 'auth/user-disabled' }), /disabled/i);
  assert.equal(mapGoogleAuthError({ message: 'Custom failure' }), 'Custom failure');
  assert.equal(mapGoogleAuthError(undefined), 'Failed to sign in with Google.');
});

test('pickFirebasePhotoUrl prefers top-level photoURL and falls back to providerData', () => {
  assert.equal(
    pickFirebasePhotoUrl('https://lh3.googleusercontent.com/a/top', [
      { photoURL: 'https://lh3.googleusercontent.com/a/provider' },
    ]),
    'https://lh3.googleusercontent.com/a/top'
  );
  assert.equal(
    pickFirebasePhotoUrl(null, [
      { photoURL: null },
      { photoURL: 'https://lh3.googleusercontent.com/a/provider' },
    ]),
    'https://lh3.googleusercontent.com/a/provider'
  );
  assert.equal(pickFirebasePhotoUrl('', [{ photoURL: '' }]), undefined);
});

test('buildResolvedUserProfile preserves existing Firestore contacts, bio, and tripsCount', () => {
  const existing = buildResolvedUserProfile({
    uid: 'uid-123',
    email: 'traveler@gmail.com',
    displayName: 'Google Name',
    avatarUrl: 'https://lh3.googleusercontent.com/a/photo',
    createdAt: '2026-01-10T00:00:00.000Z',
    memberSince: 'Jan 10, 2026',
    existingData: {
      name: 'Custom Name',
      bio: 'Flying BKK-RGN monthly',
      tripsCount: 4,
      languages: ['English', 'Burmese'],
      contacts: {
        whatsapp: '+66811112222',
        telegram: 'custom_tg',
        viber: '+9591234567',
        facebook: 'fb.me/custom',
        preferred: 'telegram',
      },
    },
  });

  assert.equal(existing.name, 'Custom Name');
  assert.equal(existing.bio, 'Flying BKK-RGN monthly');
  assert.equal(existing.tripsCount, 4);
  assert.equal(existing.contacts.whatsapp, '+66811112222');
  assert.equal(existing.contacts.preferred, 'telegram');
  assert.deepEqual(existing.languages, ['English', 'Burmese']);

  const fresh = buildResolvedUserProfile({
    uid: 'uid-999',
    email: 'newuser@gmail.com',
    displayName: 'New Google User',
    avatarUrl: 'https://lh3.googleusercontent.com/a/new',
    createdAt: '2026-11-01T00:00:00.000Z',
    memberSince: 'Nov 1, 2026',
    existingData: null,
  });

  assert.equal(fresh.name, 'New Google User');
  assert.equal(fresh.tripsCount, 0);
  assert.equal(fresh.contacts.whatsapp, '');
});
