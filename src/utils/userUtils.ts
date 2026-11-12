import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatMemberSince } from './tripUtils';

// In-memory cache for user account creation dates to eliminate duplicate Firestore calls
const accountCreationCache = new Map<string, string>();

/**
 * Generates dynamic profile picture URL using Dicebear Avataaars SVG.
 * Produces illustrated character avatars with expressions, hair, glasses, and clothing.
 * e.g. https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}
 */
export function getDicebearAvatar(seed?: string): string {
  const cleanSeed = encodeURIComponent((seed || 'traveler').trim());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}`;
}

/**
 * Normalizes avatar URLs to ensure the Avataaars style is used,
 * automatically migrating legacy placeholder assets and older identicon URLs.
 */
export function normalizeAvatarUrl(avatarUrl?: string, seed?: string): string {
  if (
    !avatarUrl ||
    avatarUrl.includes('traveler_profile_avatar') ||
    avatarUrl.includes('dicebear.com/7.x/identicon')
  ) {
    return getDicebearAvatar(seed);
  }
  return avatarUrl;
}

// Fallback dates for known demo travelers
export const KNOWN_TRAVELER_DATES: Record<string, string> = {
  'alex thant': '2026-01-15T00:00:00.000Z',
  'elena rostova': '2026-02-01T00:00:00.000Z',
  'kenji sato': '2026-02-10T00:00:00.000Z',
  'user-thant': '2026-01-15T00:00:00.000Z',
  'user-elena': '2026-02-01T00:00:00.000Z',
  'user-kenji': '2026-02-10T00:00:00.000Z',
};

/**
 * Synchronously checks if a traveler's account creation date is already known.
 */
export function getCachedAccountDate(userId?: string, travelerName?: string): string | null {
  if (userId && accountCreationCache.has(userId)) {
    return accountCreationCache.get(userId)!;
  }

  // Check current logged-in Firebase user
  if (userId && auth.currentUser && auth.currentUser.uid === userId && auth.currentUser.metadata.creationTime) {
    const iso = new Date(auth.currentUser.metadata.creationTime).toISOString();
    accountCreationCache.set(userId, iso);
    return iso;
  }

  // Check known demo travelers
  if (userId && KNOWN_TRAVELER_DATES[userId]) {
    return KNOWN_TRAVELER_DATES[userId];
  }

  if (travelerName) {
    const normalized = travelerName.trim().toLowerCase();
    if (KNOWN_TRAVELER_DATES[normalized]) {
      return KNOWN_TRAVELER_DATES[normalized];
    }
  }

  return null;
}

/**
 * Asynchronously fetches a traveler's authentic account creation date from Firestore.
 */
export async function fetchTravelerAccountDate(
  userId?: string,
  travelerName?: string,
  fallbackDate?: string
): Promise<string | null> {
  const cached = getCachedAccountDate(userId, travelerName);
  if (cached) return cached;

  if (!userId) {
    return fallbackDate || null;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const createdAt = data.createdAt || data.memberSince;
      if (createdAt) {
        accountCreationCache.set(userId, createdAt);
        return createdAt;
      }
    }
  } catch (err) {
    console.debug('[userUtils] Traveler account date offline fallback:', err);
  }

  if (fallbackDate) {
    accountCreationCache.set(userId, fallbackDate);
    return fallbackDate;
  }

  return null;
}

/**
 * React hook to resolve a traveler's account creation date.
 * Resolves authentic account creation date from Firestore users collection or cache,
 * ensuring "Member since" accurately reflects when the account was registered.
 */
export function useTravelerAccountDate(
  userId?: string,
  travelerName?: string,
  initialDate?: string
): {
  accountDate: string | null;
  formattedMemberSince: string;
} {
  const initialResolved = getCachedAccountDate(userId, travelerName) || initialDate || null;
  const [accountDate, setAccountDate] = useState<string | null>(initialResolved);

  useEffect(() => {
    let isMounted = true;
    const immediate = getCachedAccountDate(userId, travelerName);
    if (immediate) {
      setAccountDate(immediate);
      return;
    }

    if (userId) {
      fetchTravelerAccountDate(userId, travelerName, initialDate).then((resolved) => {
        if (isMounted && resolved) {
          setAccountDate(resolved);
        }
      });
    } else if (initialDate) {
      setAccountDate(initialDate);
    }

    return () => {
      isMounted = false;
    };
  }, [userId, travelerName, initialDate]);

  const displayDate = accountDate || initialDate;
  return {
    accountDate: displayDate || null,
    formattedMemberSince: formatMemberSince(displayDate),
  };
}
