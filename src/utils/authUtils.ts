import { User } from '../types/user';

export interface FirebaseAuthErrorLike {
  code?: string;
  message?: string;
}

export interface ProviderProfileLike {
  photoURL?: string | null;
}

/**
 * Maps Firebase Auth Google Sign-In error codes into clear, actionable user messages.
 */
export function mapGoogleAuthError(
  err?: FirebaseAuthErrorLike | null,
  hostname?: string
): string {
  const code = err?.code;

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window was opened. Please try signing in with Google again.';
    case 'auth/unauthorized-domain':
      return hostname
        ? `Domain "${hostname}" is not authorized for Google Sign-In. Add it in Firebase Console (project luukyone-b17b7) > Authentication > Settings > Authorized domains.`
        : 'This domain is not authorized for Google Sign-In. Add it in Firebase Console (project luukyone-b17b7) > Authentication > Settings > Authorized domains.';
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Google Sign-in is not yet enabled in your Firebase Console (project luukyone-b17b7). Please open Firebase Console > Authentication > Sign-in method and enable "Google".';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method. Please sign in with your email and password instead.';
    case 'auth/user-disabled':
      return 'This Google account has been disabled in Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Network error connecting to Google / Firebase Authentication. Check your internet connection and try again.';
    case 'auth/internal-error':
      return 'Google authentication encountered an internal error. Verify your Firebase Authorized domains and Google sign-in configuration.';
    default:
      return err?.message || 'Failed to sign in with Google.';
  }
}

/**
 * Picks the best available profile photo URL from the Firebase user or linked provider entries.
 */
export function pickFirebasePhotoUrl(
  photoURL?: string | null,
  providerData?: Array<ProviderProfileLike | null | undefined> | null
): string | undefined {
  if (photoURL && photoURL.trim()) {
    return photoURL.trim();
  }
  if (Array.isArray(providerData)) {
    for (const provider of providerData) {
      if (provider?.photoURL && provider.photoURL.trim()) {
        return provider.photoURL.trim();
      }
    }
  }
  return undefined;
}

export interface ResolveProfileParams {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl: string;
  createdAt: string;
  memberSince: string;
  existingData?: Record<string, any> | null;
  authProvider?: 'google' | 'password' | 'demo';
  isGoogleVerified?: boolean;
}

/**
 * Deterministically merges Firebase Auth identity with existing Firestore user data
 * without overwriting saved contacts, bio, or trip history.
 */
export function buildResolvedUserProfile({
  uid,
  email,
  displayName,
  avatarUrl,
  createdAt,
  memberSince,
  existingData,
  authProvider,
  isGoogleVerified,
}: ResolveProfileParams): User {
  const cleanEmail = (email || existingData?.email || '').trim();
  const fallbackName = cleanEmail ? cleanEmail.split('@')[0] : 'Traveler';
  const data = existingData || {};
  const resolvedProvider: 'google' | 'password' | 'demo' | undefined =
    authProvider ||
    data.authProvider ||
    (isGoogleVerified || data.isGoogleVerified ? 'google' : undefined);
  const resolvedGoogleVerified = Boolean(
    isGoogleVerified || data.isGoogleVerified || resolvedProvider === 'google'
  );

  return {
    id: uid,
    name: data.name || displayName || fallbackName,
    email: cleanEmail,
    avatarUrl,
    bio:
      data.bio ||
      (existingData
        ? 'Community traveler on LuuKyone.'
        : 'Community traveler sharing extra baggage allowance.'),
    isVerified: false,
    isGoogleVerified: resolvedGoogleVerified,
    ...(resolvedProvider ? { authProvider: resolvedProvider } : {}),
    createdAt,
    memberSince,
    contacts: {
      whatsapp: data.contacts?.whatsapp || '',
      viber: data.contacts?.viber || '',
      telegram: data.contacts?.telegram || '',
      facebook: data.contacts?.facebook || '',
      preferred: data.contacts?.preferred || 'whatsapp',
    },
    tripsCount: data.tripsCount || 0,
    languages: data.languages || ['English', 'Myanmar'],
  };
}
