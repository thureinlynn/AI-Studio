import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  verifyFirebaseIdToken,
  sanitizeTripInput,
  sanitizeUserInput,
  isTripOwner,
  isValidTripStatus,
  isValidTripId,
  sanitizeHttpUrl,
  resolveAllowedCorsOrigin,
  checkRateLimit,
  DEFAULT_FIREBASE_PROJECT_ID,
} from './security.ts';

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signTestJwt(
  payload: Record<string, any>,
  privateKey: crypto.KeyObject,
  kid: string = 'test-key-1',
  alg: string = 'RS256'
): string {
  const header = { alg, typ: 'JWT', kid };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${encodedHeader}.${encodedPayload}`);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

test('verifyFirebaseIdToken accepts a valid signed Firebase ID token and rejects tampered/expired/wrong-audience tokens', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const certs = { 'test-key-1': publicPem };
  const now = 1_800_000_000;

  const basePayload = {
    iss: `https://securetoken.google.com/${DEFAULT_FIREBASE_PROJECT_ID}`,
    aud: DEFAULT_FIREBASE_PROJECT_ID,
    auth_time: now - 60,
    user_id: 'uid-real-123',
    sub: 'uid-real-123',
    iat: now - 30,
    exp: now + 3600,
    email: 'Traveler@Example.com ',
    email_verified: true,
    name: 'Alice Traveler',
    firebase: { sign_in_provider: 'google.com' },
  };

  const validToken = signTestJwt(basePayload, privateKey);
  const verified = await verifyFirebaseIdToken(`Bearer ${validToken}`, {
    getCerts: async () => certs,
    nowSeconds: now,
  });
  assert.ok(verified);
  assert.equal(verified.uid, 'uid-real-123');
  assert.equal(verified.email, 'traveler@example.com');
  assert.equal(verified.emailVerified, true);
  assert.equal(verified.signInProvider, 'google.com');

  // Tampered payload
  const parts = validToken.split('.');
  const spoofedPayload = base64UrlEncode(JSON.stringify({ ...basePayload, sub: 'uid-admin-999' }));
  const tamperedToken = `${parts[0]}.${spoofedPayload}.${parts[2]}`;
  assert.equal(
    await verifyFirebaseIdToken(`Bearer ${tamperedToken}`, { getCerts: async () => certs, nowSeconds: now }),
    null
  );

  // Expired token
  const expiredToken = signTestJwt({ ...basePayload, exp: now - 600 }, privateKey);
  assert.equal(
    await verifyFirebaseIdToken(`Bearer ${expiredToken}`, { getCerts: async () => certs, nowSeconds: now }),
    null
  );

  // Wrong audience
  const wrongAudToken = signTestJwt({ ...basePayload, aud: 'other-project' }, privateKey);
  assert.equal(
    await verifyFirebaseIdToken(`Bearer ${wrongAudToken}`, { getCerts: async () => certs, nowSeconds: now }),
    null
  );

  // Wrong issuer
  const wrongIssToken = signTestJwt({ ...basePayload, iss: 'https://evil.example.com' }, privateKey);
  assert.equal(
    await verifyFirebaseIdToken(`Bearer ${wrongIssToken}`, { getCerts: async () => certs, nowSeconds: now }),
    null
  );

  // Missing token
  assert.equal(await verifyFirebaseIdToken('', { getCerts: async () => certs, nowSeconds: now }), null);
  assert.equal(await verifyFirebaseIdToken(null, { getCerts: async () => certs, nowSeconds: now }), null);
});

test('sanitizeTripInput enforces authenticated uid, strips spoofing flags, and validates bounds', () => {
  const authUser = {
    uid: 'real-user-1',
    email: 'real@example.com',
    name: 'Real User',
    signInProvider: 'password',
  };

  const result = sanitizeTripInput(
    {
      id: 'trip-valid-001',
      userId: 'spoofed-victim-uid',
      departureCity: 'Bangkok\x00',
      departureCountry: 'Thailand',
      arrivalCity: 'Yangon',
      arrivalCountry: 'Myanmar',
      lastDropOffDate: '2026-12-01',
      checkOutDate: '2026-12-02',
      weightCapacityKg: 10,
      weightAvailableKg: 8,
      serviceFeeType: 'free',
      announcement: 'Safe\x07 trip note',
      traveler: {
        name: 'Spoofer',
        isVerified: true,
        avatarUrl: 'javascript:alert(1)',
      },
      contacts: {
        whatsapp: '+66812345678',
        facebook: 'https://facebook.com/real',
        preferred: 'whatsapp',
      },
    },
    authUser
  );

  assert.ok(result.trip);
  assert.equal(result.trip.userId, 'real-user-1');
  assert.equal(result.trip.traveler.isVerified, false);
  assert.equal(result.trip.traveler.avatarUrl, '');
  assert.equal(result.trip.departureCity, 'Bangkok');
  assert.equal(result.trip.announcement, 'Safe trip note');

  // Reject out-of-range weight
  const invalidWeight = sanitizeTripInput(
    {
      departureCity: 'Bangkok',
      arrivalCity: 'Yangon',
      lastDropOffDate: '2026-12-01',
      checkOutDate: '2026-12-02',
      weightAvailableKg: 500,
    },
    authUser
  );
  assert.ok(invalidWeight.error);
  assert.equal(invalidWeight.trip, undefined);

  // Reject invalid payload shape
  assert.ok(sanitizeTripInput(null, authUser).error);
  assert.ok(sanitizeTripInput([], authUser).error);
});

test('sanitizeUserInput enforces authenticated uid and email and blocks malicious avatar URLs', () => {
  const authUser = {
    uid: 'uid-abc',
    email: 'owner@example.com',
    emailVerified: false,
    name: 'Owner Name',
  };

  const { user, error } = sanitizeUserInput(
    {
      id: 'victim-uid',
      email: 'attacker@evil.com',
      isVerified: true,
      avatarUrl: 'data:text/html,<script>alert(1)</script>',
      name: 'Clean Name',
    },
    authUser
  );

  assert.equal(error, undefined);
  assert.ok(user);
  assert.equal(user.id, 'uid-abc');
  assert.equal(user.email, 'owner@example.com');
  assert.equal(user.isVerified, false);
  assert.equal(user.avatarUrl, '');
});

test('ownership, status, ID, URL, CORS, and rate limit guards behave safely', () => {
  assert.equal(isTripOwner({ userId: 'u1' }, 'u1'), true);
  assert.equal(isTripOwner({ userId: 'u1' }, 'u2'), false);
  assert.equal(isTripOwner({ userId: '' }, ''), false);

  assert.equal(isValidTripStatus('active'), true);
  assert.equal(isValidTripStatus('fully_booked'), true);
  assert.equal(isValidTripStatus('hacked'), false);

  assert.equal(isValidTripId('trip-1234_abc'), true);
  assert.equal(isValidTripId('../etc/passwd'), false);

  assert.equal(sanitizeHttpUrl('https://example.com/ok'), 'https://example.com/ok');
  assert.equal(sanitizeHttpUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeHttpUrl('data:image/svg+xml,<svg/>'), '');

  assert.equal(
    resolveAllowedCorsOrigin({ headers: { origin: 'https://luukyone.astronerd.me', host: 'luukyone.astronerd.me' } }),
    'https://luukyone.astronerd.me'
  );
  assert.equal(
    resolveAllowedCorsOrigin({ headers: { origin: 'https://evil-attacker.com', host: 'luukyone.astronerd.me' } }),
    null
  );

  const req = { ip: '203.0.113.5', headers: {} };
  assert.equal(checkRateLimit(req, 'test-bucket', 2, 60_000), true);
  assert.equal(checkRateLimit(req, 'test-bucket', 2, 60_000), true);
  assert.equal(checkRateLimit(req, 'test-bucket', 2, 60_000), false);
});
