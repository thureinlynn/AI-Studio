import crypto from 'crypto';
import type { TripPost, TripStatus } from '../src/types/trip.ts';
import type { UserAccount } from './storage.ts';

export const DEFAULT_FIREBASE_PROJECT_ID = 'luukyone-b17b7';
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  signInProvider?: string;
}

interface CertCacheEntry {
  certs: Record<string, string>;
  expiresAt: number;
}

let certCache: CertCacheEntry | null = null;

export function getFirebaseProjectId(): string {
  return (process.env.FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID).trim();
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLen), 'base64');
}

function parseMaxAgeSeconds(cacheControlHeader: string | null): number {
  if (!cacheControlHeader) return 3600;
  const match = cacheControlHeader.match(/max-age=(\d+)/i);
  if (!match) return 3600;
  const seconds = parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 86400) : 3600;
}

async function fetchGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expiresAt > now) {
    return certCache.certs;
  }

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${res.status})`);
  }

  const certs = (await res.json()) as Record<string, string>;
  const maxAge = parseMaxAgeSeconds(res.headers.get('cache-control'));
  certCache = {
    certs,
    expiresAt: now + maxAge * 1000,
  };
  return certs;
}

export function clearCertCacheForTests(): void {
  certCache = null;
}

/**
 * Verifies a Firebase Auth ID token (RS256 JWT) using Google's public X.509 certificates.
 * Requires no IAM credentials or service account JSON.
 */
export async function verifyFirebaseIdToken(
  authHeaderOrToken?: string | null,
  options?: {
    getCerts?: () => Promise<Record<string, string>>;
    projectId?: string;
    nowSeconds?: number;
  }
): Promise<VerifiedFirebaseUser | null> {
  if (!authHeaderOrToken || typeof authHeaderOrToken !== 'string') {
    return null;
  }

  const raw = authHeaderOrToken.trim();
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : raw;
  if (!token || token.length > 8192) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  let header: any;
  let payload: any;
  try {
    header = JSON.parse(base64UrlDecodeToBuffer(encodedHeader).toString('utf8'));
    payload = JSON.parse(base64UrlDecodeToBuffer(encodedPayload).toString('utf8'));
  } catch {
    return null;
  }

  if (!header || typeof header !== 'object' || header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const projectId = options?.projectId || getFirebaseProjectId();
  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const clockSkew = 300; // 5 minutes tolerance

  if (payload.aud !== projectId) {
    return null;
  }

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    return null;
  }

  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds - clockSkew) {
    return null;
  }

  if (typeof payload.iat !== 'number' || payload.iat > nowSeconds + clockSkew) {
    return null;
  }

  if (typeof payload.auth_time === 'number' && payload.auth_time > nowSeconds + clockSkew) {
    return null;
  }

  if (typeof payload.sub !== 'string' || !payload.sub.trim() || payload.sub.length > 128) {
    return null;
  }

  let certs: Record<string, string>;
  try {
    certs = options?.getCerts ? await options.getCerts() : await fetchGooglePublicCerts();
  } catch {
    return null;
  }

  const pem = certs[header.kid];
  if (!pem || typeof pem !== 'string') {
    return null;
  }

  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();
    const signature = base64UrlDecodeToBuffer(encodedSignature);
    const valid = verifier.verify(pem, signature);
    if (!valid) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    uid: payload.sub.trim(),
    email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : undefined,
    emailVerified: Boolean(payload.email_verified),
    name: typeof payload.name === 'string' ? payload.name.trim() : undefined,
    picture: typeof payload.picture === 'string' ? payload.picture.trim() : undefined,
    signInProvider:
      typeof payload.firebase?.sign_in_provider === 'string'
        ? payload.firebase.sign_in_provider
        : undefined,
  };
}

/**
 * Strips ASCII control characters and caps string length.
 */
export function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Validates HTTP(S) URLs to block javascript:, data:, vbscript:, or malformed schemes.
 */
export function sanitizeHttpUrl(value: unknown, maxLen: number = 512): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().slice(0, maxLen);
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

export function isValidTripStatus(status: unknown): status is TripStatus {
  return status === 'active' || status === 'fully_booked' || status === 'completed';
}

export function isValidTripId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{3,80}$/.test(id);
}

export function isTripOwner(trip: Pick<TripPost, 'userId'> | null | undefined, uid: string): boolean {
  return Boolean(trip && typeof trip.userId === 'string' && trip.userId.trim() !== '' && trip.userId === uid);
}

export function sanitizeTripInput(
  rawBody: unknown,
  authUser: VerifiedFirebaseUser
): { trip?: TripPost; error?: string } {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { error: 'Invalid trip payload' };
  }

  const body = rawBody as Record<string, any>;
  const departureCity = sanitizeText(body.departureCity, 100);
  const arrivalCity = sanitizeText(body.arrivalCity, 100);
  if (!departureCity || !arrivalCity) {
    return { error: 'Departure and arrival cities are required' };
  }

  const lastDropOffDate = sanitizeText(body.lastDropOffDate, 30);
  const checkOutDate = sanitizeText(body.checkOutDate, 30);
  if (!lastDropOffDate || !checkOutDate) {
    return { error: 'Drop-off and delivery dates are required' };
  }

  const weightCapacityKg = Number(body.weightCapacityKg ?? body.weightAvailableKg);
  const weightAvailableKg = Number(body.weightAvailableKg ?? body.weightCapacityKg);
  if (
    !Number.isFinite(weightCapacityKg) ||
    !Number.isFinite(weightAvailableKg) ||
    weightAvailableKg < 0.5 ||
    weightAvailableKg > 200 ||
    weightCapacityKg < 0.5 ||
    weightCapacityKg > 200
  ) {
    return { error: 'Weight capacity must be between 0.5 kg and 200 kg' };
  }

  const allowedFees = new Set(['free', 'voluntary_tip', 'shared_cost']);
  const serviceFeeType = allowedFees.has(body.serviceFeeType)
    ? (body.serviceFeeType as TripPost['serviceFeeType'])
    : 'free';

  const status: TripStatus = isValidTripStatus(body.status) ? body.status : 'active';
  const id = isValidTripId(body.id)
    ? body.id
    : `trip-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const rawContacts = body.contacts && typeof body.contacts === 'object' ? body.contacts : {};
  const allowedPreferred = new Set(['whatsapp', 'viber', 'telegram', 'facebook', 'any']);
  const preferred = allowedPreferred.has(rawContacts.preferred) ? rawContacts.preferred : 'whatsapp';

  const rawTraveler = body.traveler && typeof body.traveler === 'object' ? body.traveler : {};
  const isGoogle = authUser.signInProvider === 'google.com';

  const trip: TripPost = {
    id,
    userId: authUser.uid, // Enforced strictly from verified token
    departureCity,
    departureCountry: sanitizeText(body.departureCountry, 100) || 'Global',
    ...(body.departureAirportCode ? { departureAirportCode: sanitizeText(body.departureAirportCode, 10) } : {}),
    arrivalCity,
    arrivalCountry: sanitizeText(body.arrivalCountry, 100) || 'Global',
    ...(body.arrivalAirportCode ? { arrivalAirportCode: sanitizeText(body.arrivalAirportCode, 10) } : {}),
    departureDate: sanitizeText(body.departureDate, 30) || lastDropOffDate,
    arrivalDate: sanitizeText(body.arrivalDate, 30) || checkOutDate,
    lastDropOffDate,
    checkOutDate,
    weightCapacityKg,
    weightAvailableKg,
    serviceFeeType,
    feeDescription: sanitizeText(body.feeDescription, 200) || 'Free peer-to-peer baggage carrier',
    announcement: sanitizeText(body.announcement, 2000),
    ...(body.flightNumber ? { flightNumber: sanitizeText(body.flightNumber, 20) } : {}),
    dropOffLocationNote: sanitizeText(body.dropOffLocationNote, 500),
    pickUpLocationNote: sanitizeText(body.pickUpLocationNote, 500),
    acceptedItems: Array.isArray(body.acceptedItems)
      ? body.acceptedItems.slice(0, 20).map((item: unknown) => sanitizeText(item, 80)).filter(Boolean)
      : [],
    prohibitedItems: Array.isArray(body.prohibitedItems)
      ? body.prohibitedItems.slice(0, 20).map((item: unknown) => sanitizeText(item, 100)).filter(Boolean)
      : [],
    contacts: {
      whatsapp: sanitizeText(rawContacts.whatsapp, 40),
      viber: sanitizeText(rawContacts.viber, 40),
      telegram: sanitizeText(rawContacts.telegram, 64),
      facebook: sanitizeText(rawContacts.facebook, 200),
      preferred,
    },
    traveler: {
      name: sanitizeText(rawTraveler.name, 80) || authUser.name || 'Traveler',
      avatarUrl: sanitizeHttpUrl(rawTraveler.avatarUrl, 512) || sanitizeHttpUrl(authUser.picture, 512),
      rating: 5.0,
      reviewCount: 0,
      tripsCompleted: 0,
      isVerified: false, // Never allow client spoofing of platform verification badge
      isGoogleVerified: isGoogle,
      authProvider: isGoogle ? 'google' : 'password',
      createdAt: sanitizeText(rawTraveler.createdAt, 40) || new Date().toISOString(),
      memberSince: sanitizeText(rawTraveler.memberSince, 40) || '2026',
      bio: sanitizeText(rawTraveler.bio, 400),
      languages: Array.isArray(rawTraveler.languages)
        ? rawTraveler.languages.slice(0, 10).map((l: unknown) => sanitizeText(l, 40)).filter(Boolean)
        : ['English'],
    },
    createdAt: sanitizeText(body.createdAt, 40) || new Date().toISOString(),
    status,
  };

  return { trip };
}

export function sanitizeUserInput(
  rawBody: unknown,
  authUser: VerifiedFirebaseUser
): { user?: UserAccount; error?: string } {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { error: 'Invalid user payload' };
  }

  const body = rawBody as Record<string, any>;
  const email = authUser.email || sanitizeText(body.email, 160).toLowerCase();
  const name = sanitizeText(body.name, 80) || authUser.name || (email ? email.split('@')[0] : 'Traveler');

  if (!email) {
    return { error: 'Verified email is required' };
  }

  const rawContacts = body.contacts && typeof body.contacts === 'object' ? body.contacts : {};
  const allowedPreferred = new Set(['whatsapp', 'viber', 'telegram', 'facebook', 'any']);

  const user: UserAccount = {
    id: authUser.uid, // Enforced strictly from verified token
    email,
    name,
    avatarUrl: sanitizeHttpUrl(body.avatarUrl, 512) || sanitizeHttpUrl(authUser.picture, 512),
    bio: sanitizeText(body.bio, 400) || 'Community luggage traveler',
    isVerified: Boolean(authUser.emailVerified),
    contacts: {
      whatsapp: sanitizeText(rawContacts.whatsapp, 40),
      viber: sanitizeText(rawContacts.viber, 40),
      telegram: sanitizeText(rawContacts.telegram, 64),
      preferred: allowedPreferred.has(rawContacts.preferred) ? rawContacts.preferred : 'whatsapp',
    },
    rating: 5.0,
    tripsCompleted: 0,
    memberSince: sanitizeText(body.memberSince, 40) || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    languages: Array.isArray(body.languages)
      ? body.languages.slice(0, 10).map((l: unknown) => sanitizeText(l, 40)).filter(Boolean)
      : ['English', 'Myanmar'],
    createdAt: sanitizeText(body.createdAt, 40) || new Date().toISOString(),
  };

  return { user };
}

/**
 * Computes allowed CORS origin (strict allowlist, no wildcard '*').
 */
export function resolveAllowedCorsOrigin(req: any): string | null {
  const origin = req?.headers?.origin;
  if (!origin || typeof origin !== 'string') return null;

  const allowed = new Set<string>(['https://luukyone.astronerd.me']);

  if (process.env.APP_URL) {
    try {
      allowed.add(new URL(process.env.APP_URL).origin);
    } catch {}
  }

  if (process.env.VERCEL_URL) {
    allowed.add(`https://${process.env.VERCEL_URL}`);
  }

  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (typeof host === 'string' && host.trim()) {
    allowed.add(`https://${host.trim()}`);
    allowed.add(`http://${host.trim()}`);
  }

  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }

  return allowed.has(origin) ? origin : null;
}

export function applyCorsHeaders(req: any, res: any, methods: string = 'GET, POST, PATCH, DELETE, OPTIONS'): void {
  const allowedOrigin = resolveAllowedCorsOrigin(req);
  res.setHeader('Vary', 'Origin');
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function applySecurityHeaders(req: any, res: any): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  const proto = req?.headers?.['x-forwarded-proto'];
  if (process.env.NODE_ENV === 'production' || proto === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

// Lightweight sliding-window rate limiter per IP + bucket
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  req: any,
  bucket: string,
  maxRequests: number,
  windowMs: number = 60_000
): boolean {
  const forwarded = req?.headers?.['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    'unknown';
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const existing = rateBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    if (rateBuckets.size > 5000) {
      for (const [k, v] of rateBuckets.entries()) {
        if (v.resetAt <= now) rateBuckets.delete(k);
      }
    }
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count += 1;
  return true;
}
