import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { formatMemberSince } from '../utils/tripUtils';
import { getDicebearAvatar, normalizeAvatarUrl, isAuthenticPhotoUrl } from '../utils/userUtils';
import { mapGoogleAuthError, pickFirebasePhotoUrl, buildResolvedUserProfile } from '../utils/authUtils';

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFirebase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithFirebase: (
    email: string,
    password: string,
    profileData: {
      name: string;
      whatsapp?: string;
      viber?: string;
      telegram?: string;
      facebook?: string;
      bio?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserContacts: (contacts: { whatsapp: string; viber: string; telegram: string; facebook?: string }) => Promise<void>;
  resetAuth: () => void;
  instantSignIn: (email: string, name?: string) => { success: boolean };
  loginAsDemoUser: (userPreset?: 'alex' | 'elena' | 'kenji') => void;
  loginWithEmail: (email: string, name?: string) => void;
  registerUser: (data: any) => void;
}

const STORAGE_KEY = 'luukyone_auth_user_v2';
const ACCOUNT_CREATION_KEY = 'luukyone_account_creation_dates';

export const getOrSetLocalAccountCreationTime = (email: string): string => {
  try {
    const raw = localStorage.getItem(ACCOUNT_CREATION_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = email.trim().toLowerCase();
    if (map[key]) {
      return map[key];
    }
    const nowIso = new Date().toISOString();
    map[key] = nowIso;
    localStorage.setItem(ACCOUNT_CREATION_KEY, JSON.stringify(map));
    return nowIso;
  } catch {
    return new Date().toISOString();
  }
};

export const DEMO_USERS: Record<string, User> = {
  alex: {
    id: 'user-thant',
    name: 'Alex Thant',
    email: 'alex.thant@travelmail.com',
    avatarUrl: getDicebearAvatar('user-thant'),
    bio: 'Frequent flyer between Bangkok & Yangon. Reliable community carrier.',
    isVerified: false,
    createdAt: '2026-01-15T00:00:00.000Z',
    memberSince: 'Jan 15, 2026',
    contacts: {
      whatsapp: '+66829143821',
      viber: '+959450029311',
      telegram: 'alex_thant_travel',
      facebook: '',
      preferred: 'whatsapp',
    },
    tripsCount: 19,
    languages: ['English', 'Burmese', 'Thai'],
  },
  elena: {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@globetrot.com',
    avatarUrl: getDicebearAvatar('user-elena'),
    bio: 'Digital nomad and international event producer.',
    isVerified: false,
    createdAt: '2026-02-01T00:00:00.000Z',
    memberSince: 'Feb 1, 2026',
    contacts: {
      whatsapp: '+33682194552',
      viber: '+33682194552',
      telegram: 'elena_travels',
      facebook: '',
      preferred: 'telegram',
    },
    tripsCount: 12,
    languages: ['English', 'French', 'Russian'],
  },
  kenji: {
    id: 'user-kenji',
    name: 'Kenji Sato',
    email: 'kenji.sato@tokyo-design.jp',
    avatarUrl: getDicebearAvatar('user-kenji'),
    bio: 'Tech consultant flying Tokyo <-> Singapore weekly.',
    isVerified: false,
    createdAt: '2026-02-10T00:00:00.000Z',
    memberSince: 'Feb 10, 2026',
    contacts: {
      whatsapp: '+819012345678',
      viber: '+819012345678',
      telegram: 'kenji_tokyo',
      facebook: '',
      preferred: 'viber',
    },
    tripsCount: 15,
    languages: ['English', 'Japanese'],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    try {
      // Purge all legacy demo sessions and test user states
      localStorage.removeItem('luggage_share_current_user');
      localStorage.removeItem('luggage_share_user');
      localStorage.removeItem('luukyone_current_user');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
    return null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Sync state with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const fbPhotoUrl = pickFirebasePhotoUrl(fbUser.photoURL, fbUser.providerData);
        const hasGoogleProvider =
          Array.isArray(fbUser.providerData) &&
          fbUser.providerData.some((p) => p?.providerId === 'google.com');
        const userMeta = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || '',
          ...(hasGoogleProvider ? { authProvider: 'google' as const, isGoogleVerified: true } : {}),
        };
        const defaultAvatar = normalizeAvatarUrl(fbPhotoUrl, fbUser.uid, userMeta);
        const savedStr = localStorage.getItem(STORAGE_KEY);
        let existingLocalProfile: User | null = null;
        if (savedStr) {
          try {
            const parsed = JSON.parse(savedStr);
            if (parsed && parsed.id === fbUser.uid) {
              const preferredRaw = isAuthenticPhotoUrl(parsed.avatarUrl)
                ? parsed.avatarUrl
                : fbPhotoUrl || parsed.avatarUrl;
              existingLocalProfile = {
                ...parsed,
                ...(hasGoogleProvider ? { authProvider: 'google' as const, isGoogleVerified: true } : {}),
                avatarUrl: normalizeAvatarUrl(preferredRaw, fbUser.uid, { ...userMeta, ...parsed }),
              };
              setUser(existingLocalProfile);
            }
          } catch {}
        }

        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let snap: any = null;
          try {
            const docPromise = getDoc(userDocRef);
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 3000)
            );
            snap = await Promise.race([docPromise, timeoutPromise]);
          } catch (docErr: any) {
            console.debug('[Firestore] Using offline cache for user profile:', docErr?.message);
          }

          const accountCreatedAt =
            (fbUser.metadata?.creationTime ? new Date(fbUser.metadata.creationTime).toISOString() : null) ||
            (snap && snap.exists() && snap.data().createdAt) ||
            existingLocalProfile?.createdAt ||
            new Date().toISOString();
          const accountMemberSince = formatMemberSince(accountCreatedAt);

          if (snap && snap.exists()) {
            const data = snap.data();
            const preferredRaw = isAuthenticPhotoUrl(data.avatarUrl)
              ? data.avatarUrl
              : fbPhotoUrl || data.avatarUrl;
            const avatar = normalizeAvatarUrl(preferredRaw, fbUser.uid, { ...userMeta, ...data });
            const shouldMarkGoogle = hasGoogleProvider && (!data.isGoogleVerified || data.authProvider !== 'google');

            // Ensure Firestore user document has the true account creation date, Google verification flag, and normalized avatar
            if ((accountCreatedAt && data.createdAt !== accountCreatedAt) || data.avatarUrl !== avatar || shouldMarkGoogle) {
              setDoc(
                userDocRef,
                {
                  createdAt: accountCreatedAt,
                  memberSince: accountMemberSince,
                  avatarUrl: avatar,
                  ...(hasGoogleProvider ? { isGoogleVerified: true, authProvider: 'google' } : {}),
                },
                { merge: true }
              ).catch(() => {});
            }
            const profile = buildResolvedUserProfile({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              avatarUrl: avatar,
              createdAt: accountCreatedAt,
              memberSince: accountMemberSince,
              existingData: data,
              ...(hasGoogleProvider ? { authProvider: 'google' as const, isGoogleVerified: true } : {}),
            });
            setUser(profile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          } else if (snap && !snap.exists()) {
            // First time login - auto provision profile document in Firestore
            const initialProfile = buildResolvedUserProfile({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              avatarUrl: defaultAvatar,
              createdAt: accountCreatedAt,
              memberSince: accountMemberSince,
              existingData: null,
              authProvider: hasGoogleProvider ? 'google' : 'password',
              isGoogleVerified: hasGoogleProvider,
            });
            setDoc(userDocRef, initialProfile, { merge: true }).catch(() => {});
            setUser(initialProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
          } else {
            // Offline fallback - do not overwrite existing Firestore document
            const fallbackProfile: User =
              existingLocalProfile ||
              buildResolvedUserProfile({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                avatarUrl: defaultAvatar,
                createdAt: accountCreatedAt,
                memberSince: accountMemberSince,
                existingData: { bio: 'Community traveler on LuuKyone.' },
                ...(hasGoogleProvider ? { authProvider: 'google' as const, isGoogleVerified: true } : {}),
              });
            setUser(fallbackProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackProfile));
          }
        } catch (err) {
          console.debug('[Firestore] Offline fallback applied:', err);
          const fallbackCreatedAt = fbUser.metadata.creationTime || new Date().toISOString();
          const fallbackProfile: User =
            existingLocalProfile ||
            buildResolvedUserProfile({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              avatarUrl: defaultAvatar,
              createdAt: fallbackCreatedAt,
              memberSince: formatMemberSince(fallbackCreatedAt),
              existingData: { bio: 'Traveler on LuuKyone.', languages: ['English'] },
              ...(hasGoogleProvider ? { authProvider: 'google' as const, isGoogleVerified: true } : {}),
            });
          setUser(fallbackProfile);
        }
      } else {
        // Logged out from Firebase - clean empty unauthenticated state
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoadingAuth(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;
      const fbPhotoUrl = pickFirebasePhotoUrl(fbUser.photoURL, fbUser.providerData);

      const userMeta = { id: fbUser.uid, email: fbUser.email || '', name: fbUser.displayName || '' };
      const googleAvatar = normalizeAvatarUrl(fbPhotoUrl, fbUser.uid, userMeta);

      let existingLocalProfile: User | null = null;
      try {
        const savedStr = localStorage.getItem(STORAGE_KEY);
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          if (parsed && parsed.id === fbUser.uid) {
            const preferredRaw = isAuthenticPhotoUrl(parsed.avatarUrl)
              ? parsed.avatarUrl
              : fbPhotoUrl || parsed.avatarUrl;
            existingLocalProfile = {
              ...parsed,
              avatarUrl: normalizeAvatarUrl(preferredRaw, fbUser.uid, { ...userMeta, ...parsed }),
            };
          }
        }
      } catch {}

      const userDocRef = doc(db, 'users', fbUser.uid);
      let snap: any = null;
      try {
        const docPromise = getDoc(userDocRef);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        snap = await Promise.race([docPromise, timeoutPromise]);
      } catch (e) {
        console.debug('[Firestore] Using offline fallback for Google user:', e);
      }

      const accountCreatedAt =
        (fbUser.metadata?.creationTime ? new Date(fbUser.metadata.creationTime).toISOString() : null) ||
        (snap && snap.exists() && snap.data().createdAt) ||
        existingLocalProfile?.createdAt ||
        new Date().toISOString();
      const accountMemberSince = formatMemberSince(accountCreatedAt);

      let profile: User;
      if (snap && snap.exists()) {
        const data = snap.data();
        const preferredRaw = isAuthenticPhotoUrl(data.avatarUrl)
          ? data.avatarUrl
          : fbPhotoUrl || data.avatarUrl;
        const resolvedAvatar = normalizeAvatarUrl(preferredRaw, fbUser.uid, { ...userMeta, ...data });
        if (
          (accountCreatedAt && data.createdAt !== accountCreatedAt) ||
          data.avatarUrl !== resolvedAvatar ||
          !data.isGoogleVerified ||
          data.authProvider !== 'google'
        ) {
          setDoc(
            userDocRef,
            {
              createdAt: accountCreatedAt,
              memberSince: accountMemberSince,
              avatarUrl: resolvedAvatar,
              isGoogleVerified: true,
              authProvider: 'google',
            },
            { merge: true }
          ).catch(() => {});
        }
        profile = buildResolvedUserProfile({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          avatarUrl: resolvedAvatar,
          createdAt: accountCreatedAt,
          memberSince: accountMemberSince,
          existingData: data,
          authProvider: 'google',
          isGoogleVerified: true,
        });
      } else if (snap && !snap.exists()) {
        profile = buildResolvedUserProfile({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          avatarUrl: googleAvatar,
          createdAt: accountCreatedAt,
          memberSince: accountMemberSince,
          existingData: null,
          authProvider: 'google',
          isGoogleVerified: true,
        });
        setDoc(userDocRef, profile, { merge: true }).catch(() => {});
      } else {
        // Offline / timeout fallback — preserve local data and never overwrite Firestore with blanks
        profile =
          (existingLocalProfile
            ? { ...existingLocalProfile, authProvider: 'google', isGoogleVerified: true }
            : null) ||
          buildResolvedUserProfile({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            avatarUrl: googleAvatar,
            createdAt: accountCreatedAt,
            memberSince: accountMemberSince,
            existingData: { bio: 'Community traveler on LuuKyone.' },
            authProvider: 'google',
            isGoogleVerified: true,
          });
      }

      setUser(profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch (err: any) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : undefined;
      return { success: false, error: mapGoogleAuthError(err, hostname) };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginWithFirebase = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (err: any) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/operation-not-allowed'
      ) {
        message = 'Firebase Email/Password provider is not yet enabled in your Firebase Console (project luukyone-b17b7). Please open Firebase Console > Authentication > Sign-in method and enable "Email/Password". You can also click "Instant Sign-In" below to proceed immediately.';
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        message = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error connecting to Firebase Authentication. Check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUpWithFirebase = async (
    email: string,
    password: string,
    profileData: {
      name: string;
      whatsapp?: string;
      viber?: string;
      telegram?: string;
      facebook?: string;
      bio?: string;
    }
  ) => {
    setIsLoadingAuth(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      const cleanName = profileData.name.trim() || email.split('@')[0];

      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch {}

      const creationTime = cred.user.metadata.creationTime || new Date().toISOString();
      const memberSince = formatMemberSince(creationTime);

      const cleanEmail = email.trim().toLowerCase();
      const newProfile: User = {
        id: uid,
        name: cleanName,
        email: cleanEmail,
        avatarUrl: normalizeAvatarUrl(undefined, uid, { id: uid, email: cleanEmail, name: cleanName }),
        bio: profileData.bio?.trim() || 'Community traveler sharing extra baggage allowance.',
        isVerified: false,
        isGoogleVerified: false,
        authProvider: 'password',
        createdAt: creationTime,
        memberSince: memberSince,
        contacts: {
          whatsapp: profileData.whatsapp?.trim() || '',
          viber: profileData.viber?.trim() || '',
          telegram: profileData.telegram?.trim().replace(/^@/, '') || '',
          facebook: profileData.facebook?.trim() || '',
          preferred: 'whatsapp',
        },
        tripsCount: 0,
        languages: ['English', 'Myanmar'],
      };

      try {
        await setDoc(doc(db, 'users', uid), newProfile);
      } catch (dbErr) {
        console.warn('[Firestore] Failed to store user profile:', dbErr);
      }

      setUser(newProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return { success: true };
    } catch (err: any) {
      let message = 'Failed to create account. Please try again.';
      if (
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/operation-not-allowed'
      ) {
        message = 'Firebase Email/Password provider is not yet enabled in your Firebase Console (project luukyone-b17b7). Please open Firebase Console > Authentication > Sign-in method and enable "Email/Password". You can also click "Instant Sign-In" below to proceed immediately.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error connecting to Firebase Authentication. Check your connection.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const instantSignIn = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase() || 'traveler@luukyone.com';
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const creationTime = getOrSetLocalAccountCreationTime(cleanEmail);
    const localUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: getDicebearAvatar(cleanEmail),
      bio: 'Community traveler sharing extra baggage allowance.',
      isVerified: false,
      createdAt: creationTime,
      memberSince: formatMemberSince(creationTime),
      contacts: {
        whatsapp: '',
        viber: '',
        telegram: cleanName.toLowerCase().replace(/\s+/g, '_'),
        facebook: '',
        preferred: 'whatsapp',
      },
      tripsCount: 0,
      languages: ['English', 'Myanmar'],
    };
    setUser(localUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
    return { success: true };
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      let message = 'Could not send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUserContacts = async (contacts: { whatsapp: string; viber: string; telegram: string; facebook?: string }) => {
    if (!user) return;
    const updated: User = {
      ...user,
      contacts: {
        ...user.contacts,
        ...contacts,
      },
    };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { contacts: updated.contacts }, { merge: true });
      } catch (err) {
        console.warn('Failed to update contacts in Firestore:', err);
      }
    }
  };

  const loginAsDemoUser = (preset: 'alex' | 'elena' | 'kenji' = 'alex') => {
    const demo = DEMO_USERS[preset] || DEMO_USERS.alex;
    setUser(demo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  };

  const loginWithEmail = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const creationTime = getOrSetLocalAccountCreationTime(cleanEmail);
    const localUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: getDicebearAvatar(cleanEmail),
      bio: 'Traveler on LuuKyone classified community.',
      isVerified: false,
      createdAt: creationTime,
      memberSince: formatMemberSince(creationTime),
      contacts: {
        whatsapp: '+15551234567',
        viber: '+15551234567',
        telegram: cleanName.toLowerCase().replace(/\s+/g, '_'),
        facebook: '',
        preferred: 'whatsapp',
      },
      tripsCount: 0,
      languages: ['English'],
    };
    setUser(localUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
  };

  const registerUser = (data: any) => {
    const cleanEmail = data.email?.trim().toLowerCase() || 'traveler@mail.com';
    const creationTime = getOrSetLocalAccountCreationTime(cleanEmail);
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name?.trim() || 'Traveler',
      email: cleanEmail,
      avatarUrl: getDicebearAvatar(cleanEmail),
      bio: data.bio?.trim() || 'Traveler providing extra luggage space.',
      isVerified: false,
      createdAt: creationTime,
      memberSince: formatMemberSince(creationTime),
      contacts: {
        whatsapp: data.whatsapp?.trim() || '',
        viber: data.viber?.trim() || '',
        telegram: data.telegram?.trim().replace(/^@/, '') || '',
        facebook: data.facebook?.trim() || '',
        preferred: 'whatsapp',
      },
      tripsCount: 0,
      languages: ['English', 'Myanmar'],
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const resetAuth = () => {
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoadingAuth,
        loginWithGoogle,
        loginWithFirebase,
        signUpWithFirebase,
        sendPasswordReset,
        logout,
        updateUserContacts,
        resetAuth,
        instantSignIn,
        loginAsDemoUser,
        loginWithEmail,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
