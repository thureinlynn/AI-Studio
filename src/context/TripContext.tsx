import React, { createContext, useContext, useState, useEffect } from 'react';
import { TripPost, TripFilters } from '../types/trip';
import { INITIAL_TRIPS } from '../data/mockTrips';

export interface PublicTravelerInfo {
  name: string;
  userId?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  contacts?: any;
  memberSince?: string;
  tripsCompleted?: number;
  languages?: string[];
}

interface TripContextType {
  trips: TripPost[];
  selectedTripId: string | null;
  selectedTrip: TripPost | null;
  filters: TripFilters;
  isPostModalOpen: boolean;
  isAuthModalOpen: boolean;
  isSafetyModalOpen: boolean;
  isMyTripsModalOpen: boolean;
  activeTab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings';
  publicProfileTraveler: PublicTravelerInfo | null;
  weightUnit: 'kg' | 'lb';
  currency: 'USD' | 'MMK' | 'THB';
  setFilters: React.Dispatch<React.SetStateAction<TripFilters>>;
  updateFilterField: <K extends keyof TripFilters>(field: K, value: TripFilters[K]) => void;
  resetFilters: () => void;
  openTripDetail: (id: string) => void;
  closeTripDetail: () => void;
  openPostModal: () => void;
  closePostModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSafetyModal: () => void;
  closeSafetyModal: () => void;
  openMyTripsModal: () => void;
  closeMyTripsModal: () => void;
  openPublicProfile: (traveler: any, userId?: string, contacts?: any) => void;
  closePublicProfile: () => void;
  setActiveTab: (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings') => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  setCurrency: (currency: 'USD' | 'MMK' | 'THB') => void;
  addNewTrip: (tripData: Omit<TripPost, 'id' | 'createdAt' | 'status'>) => TripPost;
  deleteTrip: (id: string) => void;
  toggleTripStatus: (id: string) => void;
  resetAllDataToDemoBeginning: () => void;
}

const STORAGE_KEY = 'luukyone_trips_v1';

const defaultFilters: TripFilters = {
  query: '',
  departureCity: '',
  arrivalCity: '',
  sortBy: 'date_asc',
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<TripPost[]>(() => {
    try {
      // Clean up legacy key
      localStorage.removeItem('luggage_share_trips_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Discard any previous mock trips
          const realTrips = parsed.filter(
            (t) =>
              !t.id.startsWith('trip-bkk-') &&
              !t.id.startsWith('trip-sin-') &&
              !t.id.startsWith('trip-dub-') &&
              !t.id.startsWith('trip-syd-') &&
              !t.id.startsWith('trip-lon-') &&
              !t.id.startsWith('trip-cdg-')
          );
          return realTrips;
        }
      }
    } catch (e) {
      console.error('Failed to load trips from storage', e);
    }
    return INITIAL_TRIPS;
  });

  const [selectedTripId, setSelectedTripId] = useState<string | null>(() => {
    // Check URL search params for deep link ?trip=id
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('trip');
    } catch {
      return null;
    }
  });

  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isMyTripsModalOpen, setIsMyTripsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'how_it_works' | 'safety' | 'my_trips' | 'settings'>('browse');
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

  const setWeightUnit = (unit: 'kg' | 'lb') => {
    setWeightUnitState(unit);
    try {
      localStorage.setItem('luukyone_weight_unit', unit);
    } catch {
      // ignore
    }
  };

  const setCurrency = (curr: 'USD' | 'MMK' | 'THB') => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('luukyone_currency', curr);
    } catch {
      // ignore
    }
  };

  const openPublicProfile = (traveler: any, userId?: string, contacts?: any) => {
    setPublicProfileTraveler({
      name: traveler.name || 'Traveler',
      userId: userId || traveler.userId || '',
      avatarUrl: traveler.avatarUrl || '',
      bio: traveler.bio || 'Community traveler on LuuKyone',
      isVerified: traveler.isVerified ?? true,
      contacts: contacts || traveler.contacts || {},
      memberSince: traveler.memberSince || '2026',
      tripsCompleted: traveler.tripsCompleted || 1,
      languages: traveler.languages || ['English', 'Myanmar'],
    });
  };

  const closePublicProfile = () => {
    setPublicProfileTraveler(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to persist trips', e);
    }
  }, [trips]);

  // Sync trips with server on mount and continuously every 4 seconds for multi-device sync
  useEffect(() => {
    let isMounted = true;

    const fetchServerTrips = async () => {
      try {
        const res = await fetch('/api/trips');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            setTrips(data);
          }
        }
      } catch {
        // Fallback to local storage state if server unavailable
      }
    };

    fetchServerTrips();
    const interval = setInterval(fetchServerTrips, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync selected trip with URL query param
  const openTripDetail = (id: string) => {
    setSelectedTripId(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('trip', id);
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeTripDetail = () => {
    setSelectedTripId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const updateFilterField = <K extends keyof TripFilters>(field: K, value: TripFilters[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const openPostModal = () => setIsPostModalOpen(true);
  const closePostModal = () => setIsPostModalOpen(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openSafetyModal = () => setIsSafetyModalOpen(true);
  const closeSafetyModal = () => setIsSafetyModalOpen(false);

  const openMyTripsModal = () => setIsMyTripsModalOpen(true);
  const closeMyTripsModal = () => setIsMyTripsModalOpen(false);

  const addNewTrip = (tripData: Omit<TripPost, 'id' | 'createdAt' | 'status'>): TripPost => {
    const newTrip: TripPost = {
      ...tripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    setTrips((prev) => [newTrip, ...prev.filter((t) => t.id !== newTrip.id)]);

    // Persist to server for cross-device visibility
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrip),
    }).catch((err) => console.error('Failed to persist trip to server:', err));

    return newTrip;
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (selectedTripId === id) {
      closeTripDetail();
    }
    fetch(`/api/trips?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch((err) => console.error('Failed to delete trip from server:', err));
  };

  const toggleTripStatus = (id: string) => {
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

    fetch(`/api/trips?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    }).catch((err) => console.error('Failed to update trip status on server:', err));
  };

  const resetAllDataToDemoBeginning = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('luggage_share_current_user');
      localStorage.removeItem('luggage_share_user');
      const url = new URL(window.location.href);
      url.searchParams.delete('trip');
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.error('Error clearing storage on reset', e);
    }
    setTrips(INITIAL_TRIPS);
    setSelectedTripId(null);
    setFilters(defaultFilters);
    setActiveTab('browse');
    setIsPostModalOpen(false);
    setIsAuthModalOpen(false);
    setIsSafetyModalOpen(false);
    setIsMyTripsModalOpen(false);
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;

  return (
    <TripContext.Provider
      value={{
        trips,
        selectedTripId,
        selectedTrip,
        filters,
        isPostModalOpen,
        isAuthModalOpen,
        isSafetyModalOpen,
        isMyTripsModalOpen,
        activeTab,
        publicProfileTraveler,
        weightUnit,
        currency,
        setFilters,
        updateFilterField,
        resetFilters,
        openTripDetail,
        closeTripDetail,
        openPostModal,
        closePostModal,
        openAuthModal,
        closeAuthModal,
        openSafetyModal,
        closeSafetyModal,
        openMyTripsModal,
        closeMyTripsModal,
        openPublicProfile,
        closePublicProfile,
        setActiveTab,
        setWeightUnit,
        setCurrency,
        addNewTrip,
        deleteTrip,
        toggleTripStatus,
        resetAllDataToDemoBeginning,
      }}
    >
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
