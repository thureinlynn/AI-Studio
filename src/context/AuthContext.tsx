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
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { formatMemberSince } from '../utils/tripUtils';

export interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
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

export const DEMO_USERS: Record<string, User> = {
  alex: {
    id: 'user-thant',
    name: 'Alex Thant',
    email: 'alex.thant@travelmail.com',
    avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
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
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
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
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          const accountCreatedAt =
            (snap.exists() && snap.data().createdAt) ||
            fbUser.metadata.creationTime ||
            new Date().toISOString();
          const accountMemberSince = formatMemberSince(accountCreatedAt);

          if (snap.exists()) {
            const data = snap.data();
            const profile: User = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler',
              email: fbUser.email || '',
              avatarUrl: data.avatarUrl || '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
              bio: data.bio || 'Community traveler on LuuKyone.',
              isVerified: false,
              createdAt: accountCreatedAt,
              memberSince: accountMemberSince,
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
            setUser(profile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          } else {
            // First time login - auto provision profile document in Firestore
            const initialProfile: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler',
              email: fbUser.email || '',
              avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
              bio: 'Community traveler sharing extra baggage allowance.',
              isVerified: false,
              createdAt: accountCreatedAt,
              memberSince: accountMemberSince,
              contacts: {
                whatsapp: '',
                viber: '',
                telegram: '',
                facebook: '',
                preferred: 'whatsapp',
              },
              tripsCount: 0,
              languages: ['English', 'Myanmar'],
            };
            await setDoc(userDocRef, initialProfile, { merge: true });
            setUser(initialProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));
          }
        } catch (err) {
          console.warn('[Firestore] Error loading user profile document:', err);
          const fallbackCreatedAt = fbUser.metadata.creationTime || new Date().toISOString();
          const fallbackProfile: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler',
            email: fbUser.email || '',
            avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
            bio: 'Traveler on LuuKyone.',
            isVerified: false,
            createdAt: fallbackCreatedAt,
            memberSince: formatMemberSince(fallbackCreatedAt),
            contacts: {
              whatsapp: '',
              viber: '',
              telegram: '',
              facebook: '',
              preferred: 'whatsapp',
            },
            tripsCount: 0,
            languages: ['English'],
          };
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

      const newProfile: User = {
        id: uid,
        name: cleanName,
        email: email.trim().toLowerCase(),
        avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
        bio: profileData.bio?.trim() || 'Community traveler sharing extra baggage allowance.',
        isVerified: false,
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
    const creationTime = new Date().toISOString();
    const localUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
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
    const creationTime = new Date().toISOString();
    const localUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
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
    const creationTime = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name?.trim() || 'Traveler',
      email: cleanEmail,
      avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
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
