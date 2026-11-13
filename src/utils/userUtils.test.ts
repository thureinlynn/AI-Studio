import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAvatarUrl,
  isAuthenticPhotoUrl,
  getDicebearAvatar,
  UNCLE_AVATAR_URL,
} from './userUtils';

test('isAuthenticPhotoUrl detects Google and data URLs', () => {
  assert.equal(isAuthenticPhotoUrl('https://lh3.googleusercontent.com/a/abc=s96-c'), true);
  assert.equal(isAuthenticPhotoUrl('data:image/png;base64,AAA'), true);
  assert.equal(isAuthenticPhotoUrl('https://api.dicebear.com/7.x/avataaars/svg?seed=u1'), false);
  assert.equal(isAuthenticPhotoUrl(''), false);
});

test('normalizeAvatarUrl preserves authentic Google photo even for admin users', () => {
  const googlePhoto = 'https://lh3.googleusercontent.com/a/ACg8ocK123=s96-c';
  const adminUser = { id: 'uid-1', email: 'thureinlynn.mm@gmail.com', name: 'Thurein', avatarUrl: googlePhoto };

  assert.equal(normalizeAvatarUrl(googlePhoto, 'uid-1', adminUser), googlePhoto);
  assert.equal(normalizeAvatarUrl(googlePhoto, 'uid-1'), googlePhoto);
});

test('normalizeAvatarUrl resolves consistent uncle avatar for admin without Google photo', () => {
  const adminUser = { id: 'uid-1', email: 'thureinlynn.mm@gmail.com', name: 'Admin' };
  const dicebear = getDicebearAvatar('uid-1');

  assert.equal(normalizeAvatarUrl(dicebear, 'uid-1', adminUser), UNCLE_AVATAR_URL);
  assert.equal(normalizeAvatarUrl('/uncle_avatar.svg', 'uid-1', adminUser), UNCLE_AVATAR_URL);
  assert.equal(normalizeAvatarUrl(undefined, 'uid-1', { name: 'Admin' }), UNCLE_AVATAR_URL);
});

test('normalizeAvatarUrl produces identical avatar across card, detail, and profile for regular users', () => {
  const uid = 'firebase-uid-123';
  const userObj = { id: uid, email: 'alice@gmail.com', name: 'Alice' };
  const expected = getDicebearAvatar(uid);

  const onHeader = normalizeAvatarUrl(expected, uid, userObj);
  const onProfile = normalizeAvatarUrl(expected, uid, userObj);
  const onCard = normalizeAvatarUrl(expected, uid, { name: 'Alice', avatarUrl: expected });
  const onPublicProfile = normalizeAvatarUrl(undefined, uid, { name: 'Alice' });

  assert.equal(onHeader, expected);
  assert.equal(onProfile, expected);
  assert.equal(onCard, expected);
  assert.equal(onPublicProfile, expected);
});
