import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginAsDemoUser: (userPreset?: 'alex' | 'elena' | 'kenji') => void;
  loginWithEmail: (email: string, name?: string) => void;
  registerUser: (data: {
    name: string;
    email: string;
    whatsapp: string;
    viber: string;
    telegram: string;
    bio?: string;
  }) => void;
  logout: () => void;
  updateUserContacts: (contacts: { whatsapp: string; viber: string; telegram: string }) => void;
  resetAuth: () => void;
}

const STORAGE_KEY = 'luggage_share_current_user';

export const DEMO_USERS: Record<string, User> = {
  alex: {
    id: 'user-thant',
    name: 'Alex Thant',
    email: 'alex.thant@travelmail.com',
    avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
    bio: 'Frequent flyer between Bangkok & Yangon. Reliable community carrier.',
    isVerified: true,
    contacts: {
      whatsapp: '+66829143821',
      viber: '+959450029311',
      telegram: 'alex_thant_travel',
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
    isVerified: true,
    contacts: {
      whatsapp: '+33682194552',
      viber: '+33682194552',
      telegram: 'elena_travels',
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
    isVerified: true,
    contacts: {
      whatsapp: '+819012345678',
      viber: '+819012345678',
      telegram: 'kenji_tokyo',
      preferred: 'viber',
    },
    tripsCount: 15,
    languages: ['English', 'Japanese'],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
    // Default to null so user starts fresh with clean unauthenticated demo
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist user', e);
    }
  }, [user]);

  const loginAsDemoUser = (preset: 'alex' | 'elena' | 'kenji' = 'alex') => {
    setUser(DEMO_USERS[preset] || DEMO_USERS.alex);
  };

  const loginWithEmail = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const localUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
      bio: 'Traveler on LuuKyone classified community.',
      isVerified: true,
      contacts: {
        whatsapp: '+15551234567',
        viber: '+15551234567',
        telegram: cleanName.toLowerCase().replace(/\s+/g, '_'),
        preferred: 'whatsapp',
      },
      tripsCount: 1,
      languages: ['English'],
    };

    setUser(localUser);

    // Call server login endpoint to retrieve existing or persist new user account
    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: cleanEmail, name: cleanName }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((serverUser) => {
        if (serverUser && serverUser.id) {
          setUser((current) => ({
            ...current,
            ...serverUser,
            contacts: serverUser.contacts || current?.contacts || localUser.contacts,
          }));
        }
      })
      .catch((err) => console.error('Failed to sync login with server:', err));
  };

  const registerUser = (data: {
    name: string;
    email: string;
    whatsapp: string;
    viber: string;
    telegram: string;
    bio?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      avatarUrl: '/src/assets/images/traveler_profile_avatar_1793803079186.jpg',
      bio: data.bio?.trim() || 'Verified traveler providing extra luggage space.',
      isVerified: true,
      contacts: {
        whatsapp: data.whatsapp.trim(),
        viber: data.viber.trim(),
        telegram: data.telegram.trim().replace(/^@/, ''),
        preferred: 'whatsapp',
      },
      tripsCount: 0,
      languages: ['English', 'Myanmar'],
    };

    setUser(newUser);

    // Persist registered user account to server
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (saved && saved.id) {
          setUser((current) => ({ ...current, ...saved }));
        }
      })
      .catch((err) => console.error('Failed to register user to server:', err));
  };

  const logout = () => {
    setUser(null);
  };

  const resetAuth = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('luggage_share_user');
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateUserContacts = (contacts: { whatsapp: string; viber: string; telegram: string }) => {
    if (!user) return;
    setUser({
      ...user,
      contacts: {
        ...user.contacts,
        ...contacts,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAsDemoUser,
        loginWithEmail,
        registerUser,
        logout,
        updateUserContacts,
        resetAuth,
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
