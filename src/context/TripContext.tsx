import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TripPost, TripFilters } from '../types/trip';
import { CargoPartner } from '../types/partner';
import { getCargoPartnerById } from '../data/cargoPartners';
import { INITIAL_TRIPS } from '../data/mockTrips';
import { auth, db, trackPageView, trackConversion, trackEvent } from '../firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
  formatMemberSince,
  buildCompletedTripsCountMap,
  getCompletedTripsCount,
  areTripListsEquivalent,
} from '../utils/tripUtils';
import { getCachedAccountDate, normalizeAvatarUrl } from '../utils/userUtils';
import { isTransientFirestoreError } from '../utils/firebaseUtils';

export interface PublicTravelerInfo {
  name: string;
  userId?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  contacts?: any;
  memberSince?: string;
  createdAt?: string;
  tripsCompleted?: number;
  languages?: string[];
}

interface TripContextType {
  trips: TripPost[];
  isLoadingTrips: boolean;
  selectedTripId: string | null;
  selectedTrip: TripPost | null;
  selectedPartnerId: string | null;
  selectedPartner: CargoPartner | null;
  filters: TripFilters;
  isPostModalOpen: boolean;
  isAuthModalOpen: boolean;
  isSafetyModalOpen: boolean;
  isMyTripsModalOpen: boolean;
  isCalculatorModalOpen: boolean;
  activeTab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings';
  publicProfileTraveler: PublicTravelerInfo | null;
  weightUnit: 'kg' | 'lb';
  currency: 'USD' | 'MMK' | 'THB';
  setFilters: React.Dispatch<React.SetStateAction<TripFilters>>;
  updateFilterField: <K extends keyof TripFilters>(field: K, value: TripFilters[K]) => void;
  resetFilters: () => void;
  openTripDetail: (id: string) => void;
  closeTripDetail: () => void;
  openPartnerDetail: (id: string) => void;
  closePartnerDetail: () => void;
  openPostModal: () => void;
  closePostModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSafetyModal: () => void;
  closeSafetyModal: () => void;
  openMyTripsModal: () => void;
  closeMyTripsModal: () => void;
  openCalculatorModal: () => void;
  closeCalculatorModal: () => void;
  openPublicProfile: (traveler: any, userId?: string, contacts?: any, createdAt?: string) => void;
  closePublicProfile: () => void;
  setActiveTab: (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  setCurrency: (currency: 'USD' | 'MMK' | 'THB') => void;
  addNewTrip: (tripData: Omit<TripPost, 'id' | 'createdAt' | 'status'>) => TripPost;
  deleteTrip: (id: string) => void;
  toggleTripStatus: (id: string) => void;
  getTravelerCompletedCount: (traveler: { name?: string; userId?: string }) => number;
  confirmDialog: { title: string; message: string; onConfirm: () => void } | null;
  closeConfirmDialog: () => void;
  resetAllDataToDemoBeginning: () => void;
}

const STORAGE_KEY = 'luukyone_trips_v2';
const FALLBACK_POLL_INTERVAL_MS = 60_000;

const defaultFilters: TripFilters = {
  query: '',
  departureCity: '',
  arrivalCity: '',
  sortBy: 'date_asc',
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialHydrationRef = useRef(true);
  const lastPersistedRef = useRef<TripPost[] | null>(null);

  const [trips, setTrips] = useState<TripPost[]>(() => {
    try {
      // Purge all legacy test data keys on launch
      localStorage.removeItem('luukyone_trips_v1');
      localStorage.removeItem('luggage_share_trips_v1');
      localStorage.removeItem('luggage_share_trips');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          lastPersistedRef.current = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load trips from storage', e);
    }
    return INITIAL_TRIPS;
  });

  const [selectedTripId, setSelectedTripId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('trip');
    } catch {
      return null;
    }
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('partner');
    } catch {
      return null;
    }
  });
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);

  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isMyTripsModalOpen, setIsMyTripsModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const closeConfirmDialog = useCallback(() => setConfirmDialog(null), []);

  const [activeTab, setActiveTabState] = useState<'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings'>('browse');

  const setActiveTab = useCallback((tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => {
    setActiveTabState(tab);
    trackPageView(`LuuKyone - ${tab.replace(/_/g, ' ')}`, `/${tab}`);
  }, []);

  useEffect(() => {
    trackPageView('LuuKyone - Peer Baggage Sharing', '/browse');
  }, []);

  const [publicProfileTraveler, setPublicProfileTraveler] = useState<PublicTravelerInfo | null>(null);

  const [weightUnit, setWeightUnitState] = useState<'kg' | 'lb'>(() => {
    try {
      return (localStorage.getItem('luukyone_weight_unit') as 'kg' | 'lb') || 'kg';
    } catch {
      return 'kg';
    }
  });

  const [currency, setCurrencyState] = useState<'USD' | 'MMK' | 'THB'>(() => {
    try {
      return (localStorage.getItem('luukyone_currency') as 'USD' | 'MMK' | 'THB') || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setWeightUnit = useCallback((unit: 'kg' | 'lb') => {
    setWeightUnitState(unit);
    try {
      localStorage.setItem('luukyone_weight_unit', unit);
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = useCallback((curr: 'USD' | 'MMK' | 'THB') => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('luukyone_currency', curr);
    } catch {
      // ignore
    }
  }, []);

  const openPublicProfile = useCallback((traveler: any, userId?: string, contacts?: any, createdAt?: string) => {
    const targetUserId = userId || traveler?.userId || '';
    const resolvedAccountDate = getCachedAccountDate(targetUserId, traveler?.name) || createdAt || traveler?.createdAt;
    setPublicProfileTraveler({
      ...traveler,
      name: traveler?.name || 'Traveler',
      userId: targetUserId,
      avatarUrl: normalizeAvatarUrl(traveler?.avatarUrl, targetUserId || traveler?.name, traveler),
      bio: traveler?.bio || 'Community traveler on LuuKyone',
      isVerified: false,
      contacts: contacts || traveler?.contacts || {},
      memberSince: formatMemberSince(resolvedAccountDate || traveler?.memberSince),
      createdAt: resolvedAccountDate,
      tripsCompleted: traveler?.tripsCompleted || 0,
      languages: traveler?.languages || ['English', 'Myanmar'],
    });
  }, []);

  const closePublicProfile = useCallback(() => {
    setPublicProfileTraveler(null);
  }, []);

  // Persist trips to localStorage only when list actually changes (skip redundant initial hydration write)
  useEffect(() => {
    if (initialHydrationRef.current) {
      initialHydrationRef.current = false;
      if (lastPersistedRef.current && areTripListsEquivalent(lastPersistedRef.current, trips)) {
        return;
      }
    }
    if (lastPersistedRef.current && areTripListsEquivalent(lastPersistedRef.current, trips)) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
      lastPersistedRef.current = trips;
    } catch (e) {
      console.error('Failed to persist trips', e);
    }
  }, [trips]);

  // Single-source real-time Firestore listener with smart fallback to /api/trips only when Firestore isn't active
  useEffect(() => {
    let isMounted = true;
    let hasFirestoreSnapshot = false;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    const abortController = new AbortController();

    const fetchServerTrips = async () => {
      if (!isMounted || hasFirestoreSnapshot) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

      try {
        const res = await fetch('/api/trips', { signal: abortController.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && isMounted && !hasFirestoreSnapshot) {
          setTrips((prev) => {
            const existingIds = new Set(data.map((d: TripPost) => d.id));
            const localUnsynced = prev.filter((p) => !existingIds.has(p.id));
            const merged = [...localUnsynced, ...data];
            return areTripListsEquivalent(prev, merged) ? prev : merged;
          });
        }
      } catch {
        // Ignore abort / transient offline errors; local cache stays intact
      } finally {
        if (isMounted) setIsLoadingTrips(false);
      }
    };

    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(
        collection(db, 'trips'),
        (snapshot) => {
          if (!isMounted) return;
          hasFirestoreSnapshot = true;
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
          if (!snapshot.empty) {
            const firestoreTrips: TripPost[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as TripPost;
              firestoreTrips.push({ ...data, id: docSnap.id });
            });
            firestoreTrips.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
            setTrips((prev) => (areTripListsEquivalent(prev, firestoreTrips) ? prev : firestoreTrips));
          }
          setIsLoadingTrips(false);
        },
        (error) => {
          if (!isTransientFirestoreError(error)) {
            console.warn('[Firestore] Sync warning (using server API fallback):', error.message);
          }
          if (isMounted) {
            setIsLoadingTrips(false);
            fetchServerTrips();
          }
        }
      );
    } catch (e) {
      if (!isTransientFirestoreError(e)) {
        console.warn('[Firestore] Initialization error:', e);
      }
      setIsLoadingTrips(false);
    }

    // Fetch /api/trips once after a brief delay only if Firestore snapshot hasn't delivered yet,
    // and only keep a slow 60s visibility-aware fallback if Firestore stays unconnected.
    const initialFallbackTimer = setTimeout(() => {
      if (!hasFirestoreSnapshot) {
        fetchServerTrips();
        fallbackInterval = setInterval(fetchServerTrips, FALLBACK_POLL_INTERVAL_MS);
      }
    }, 1500);

    return () => {
      isMounted = false;
      abortController.abort();
      clearTimeout(initialFallbackTimer);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Ensure deep-linked ?trip=<id> is fetched directly from Firestore if not yet in state
  useEffect(() => {
    if (!selectedTripId) return;
    if (trips.some((t) => t.id === selectedTripId)) return;

    let isMounted = true;
    getDoc(doc(db, 'trips', selectedTripId))
      .then((snap) => {
        if (!isMounted || !snap.exists()) return;
        const fetched = { ...(snap.data() as TripPost), id: snap.id };
        setTrips((prev) => (prev.some((t) => t.id === fetched.id) ? prev : [fetched, ...prev]));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedTripId, trips]);

  // Keep selectedTripId & selectedPartnerId in sync with browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        setSelectedTripId(params.get('trip'));
        setSelectedPartnerId(params.get('partner'));
      } catch {
        setSelectedTripId(null);
        setSelectedPartnerId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openTripDetail = useCallback((id: string) => {
    setSelectedPartnerId(null);
    setSelectedTripId(id);
    trackEvent('view_trip', { tripId: id });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('partner');
      url.searchParams.set('trip', id);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTripDetail = useCallback(() => {
    setSelectedTripId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  const openPartnerDetail = useCallback((id: string) => {
    setSelectedTripId(null);
    setSelectedPartnerId(id);
    trackEvent('view_cargo_partner', { partnerId: id });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      url.searchParams.set('partner', id);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closePartnerDetail = useCallback(() => {
    setSelectedPartnerId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('partner');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  const updateFilterField = useCallback(<K extends keyof TripFilters>(field: K, value: TripFilters[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const openPostModal = useCallback(() => setIsPostModalOpen(true), []);
  const closePostModal = useCallback(() => setIsPostModalOpen(false), []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const openSafetyModal = useCallback(() => setIsSafetyModalOpen(true), []);
  const closeSafetyModal = useCallback(() => setIsSafetyModalOpen(false), []);

  const openMyTripsModal = useCallback(() => setIsMyTripsModalOpen(true), []);
  const closeMyTripsModal = useCallback(() => setIsMyTripsModalOpen(false), []);

  const openCalculatorModal = useCallback(() => setIsCalculatorModalOpen(true), []);
  const closeCalculatorModal = useCallback(() => setIsCalculatorModalOpen(false), []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Proceed without token when signed out or offline
    }
    return headers;
  }, []);

  const addNewTrip = useCallback((tripData: Omit<TripPost, 'id' | 'createdAt' | 'status'>): TripPost => {
    const newTrip: TripPost = {
      ...tripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    setTrips((prev) => [newTrip, ...prev.filter((t) => t.id !== newTrip.id)]);

    trackConversion('create_trip', {
      from: newTrip.departureCity,
      to: newTrip.arrivalCity,
      weightKg: newTrip.weightAvailableKg,
      serviceFeeType: newTrip.serviceFeeType,
    });

    try {
      setDoc(doc(db, 'trips', newTrip.id), newTrip).catch((err) => {
        console.warn('[Firestore] Failed to store trip in db:', err);
      });
    } catch (err) {
      console.warn('[Firestore] setDoc error:', err);
    }

    getAuthHeaders()
      .then((headers) => {
        if (!headers.Authorization) return;
        return fetch('/api/trips', {
          method: 'POST',
          headers,
          body: JSON.stringify(newTrip),
        });
      })
      .catch((err) => console.error('Failed to persist trip to server:', err));

    return newTrip;
  }, [getAuthHeaders]);

  const deleteTrip = useCallback((id: string) => {
    const tripToDelete = trips.find((t) => t.id === id);
    const label = tripToDelete ? `${tripToDelete.departureCity} to ${tripToDelete.arrivalCity}` : 'this trip';
    setConfirmDialog({
      title: 'Delete Listing',
      message: `Are you sure you want to delete the trip from ${label}? This action cannot be undone.`,
      onConfirm: () => {
        setTrips((prev) => prev.filter((t) => t.id !== id));
        if (selectedTripId === id) {
          closeTripDetail();
        }

        try {
          deleteDoc(doc(db, 'trips', id)).catch((err) => {
            console.warn('[Firestore] Failed to delete trip from db:', err);
          });
        } catch (err) {
          console.warn('[Firestore] deleteDoc error:', err);
        }

        getAuthHeaders()
          .then((headers) => {
            if (!headers.Authorization) return;
            return fetch(`/api/trips?id=${encodeURIComponent(id)}`, {
              method: 'DELETE',
              headers,
              body: JSON.stringify({ id }),
            });
          })
          .catch((err) => console.error('Failed to delete trip from server:', err));
      },
    });
  }, [trips, selectedTripId, closeTripDetail, getAuthHeaders]);

  const toggleTripStatus = useCallback((id: string) => {
    const tripToToggle = trips.find((t) => t.id === id);
    const currentStatus = tripToToggle ? tripToToggle.status : 'active';
    const actionLabel = currentStatus === 'active' ? 'mark this listing as Fully Booked' : 'reactivate this listing';
    setConfirmDialog({
      title: 'Update Listing Status',
      message: `Are you sure you want to ${actionLabel}?`,
      onConfirm: () => {
        let nextStatus: 'active' | 'fully_booked' = 'fully_booked';
        setTrips((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              nextStatus = t.status === 'active' ? 'fully_booked' : 'active';
              return { ...t, status: nextStatus };
            }
            return t;
          })
        );

        try {
          updateDoc(doc(db, 'trips', id), { status: nextStatus }).catch((err) => {
            console.warn('[Firestore] Failed to update trip status in db:', err);
          });
        } catch (err) {
          console.warn('[Firestore] updateDoc error:', err);
        }

        getAuthHeaders()
          .then((headers) => {
            if (!headers.Authorization) return;
            return fetch(`/api/trips?id=${encodeURIComponent(id)}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ id, status: nextStatus }),
            });
          })
          .catch((err) => console.error('Failed to update trip status on server:', err));
      },
    });
  }, [trips, getAuthHeaders]);

  const resetAllDataToDemoBeginning = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('luggage_share_current_user');
      localStorage.removeItem('luggage_share_user');
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      url.searchParams.delete('partner');
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.error('Error clearing storage on reset', e);
    }
    setTrips(INITIAL_TRIPS);
    setSelectedTripId(null);
    setSelectedPartnerId(null);
    setFilters(defaultFilters);
    setActiveTabState('browse');
    setIsPostModalOpen(false);
    setIsAuthModalOpen(false);
    setIsSafetyModalOpen(false);
    setIsMyTripsModalOpen(false);
    setIsCalculatorModalOpen(false);
  }, []);

  const completedTripsIndex = useMemo(() => buildCompletedTripsCountMap(trips), [trips]);

  const getTravelerCompletedCount = useCallback(
    (traveler: { name?: string; userId?: string }) => getCompletedTripsCount(completedTripsIndex, traveler),
    [completedTripsIndex]
  );

  const selectedTrip = useMemo(() => trips.find((t) => t.id === selectedTripId) || null, [trips, selectedTripId]);
  const selectedPartner = useMemo(() => getCargoPartnerById(selectedPartnerId), [selectedPartnerId]);

  const contextValue = useMemo<TripContextType>(
    () => ({
      trips,
      isLoadingTrips,
      selectedTripId,
      selectedTrip,
      selectedPartnerId,
      selectedPartner,
      filters,
      isPostModalOpen,
      isAuthModalOpen,
      isSafetyModalOpen,
      isMyTripsModalOpen,
      isCalculatorModalOpen,
      activeTab,
      publicProfileTraveler,
      weightUnit,
      currency,
      setFilters,
      updateFilterField,
      resetFilters,
      openTripDetail,
      closeTripDetail,
      openPartnerDetail,
      closePartnerDetail,
      openPostModal,
      closePostModal,
      openAuthModal,
      closeAuthModal,
      openSafetyModal,
      closeSafetyModal,
      openMyTripsModal,
      closeMyTripsModal,
      openCalculatorModal,
      closeCalculatorModal,
      openPublicProfile,
      closePublicProfile,
      setActiveTab,
      setWeightUnit,
      setCurrency,
      addNewTrip,
      deleteTrip,
      toggleTripStatus,
      getTravelerCompletedCount,
      confirmDialog,
      closeConfirmDialog,
      resetAllDataToDemoBeginning,
    }),
    [
      trips,
      isLoadingTrips,
      selectedTripId,
      selectedTrip,
      selectedPartnerId,
      selectedPartner,
      filters,
      isPostModalOpen,
      isAuthModalOpen,
      isSafetyModalOpen,
      isMyTripsModalOpen,
      isCalculatorModalOpen,
      activeTab,
      publicProfileTraveler,
      weightUnit,
      currency,
      updateFilterField,
      resetFilters,
      openTripDetail,
      closeTripDetail,
      openPartnerDetail,
      closePartnerDetail,
      openPostModal,
      closePostModal,
      openAuthModal,
      closeAuthModal,
      openSafetyModal,
      closeSafetyModal,
      openMyTripsModal,
      closeMyTripsModal,
      openCalculatorModal,
      closeCalculatorModal,
      openPublicProfile,
      closePublicProfile,
      setActiveTab,
      setWeightUnit,
      setCurrency,
      addNewTrip,
      deleteTrip,
      toggleTripStatus,
      getTravelerCompletedCount,
      confirmDialog,
      closeConfirmDialog,
      resetAllDataToDemoBeginning,
    ]
  );

  return (
    <TripContext.Provider value={contextValue}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
