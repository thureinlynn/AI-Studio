import React, { createContext, useContext, useState, useEffect } from 'react';
import { TripPost, TripFilters } from '../types/trip';
import { INITIAL_TRIPS } from '../data/mockTrips';

interface TripContextType {
  trips: TripPost[];
  selectedTripId: string | null;
  selectedTrip: TripPost | null;
  filters: TripFilters;
  isPostModalOpen: boolean;
  isAuthModalOpen: boolean;
  isSafetyModalOpen: boolean;
  isMyTripsModalOpen: boolean;
  activeTab: 'browse' | 'how_it_works' | 'safety' | 'my_trips';
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
  setActiveTab: (tab: 'browse' | 'how_it_works' | 'safety' | 'my_trips') => void;
  addNewTrip: (tripData: Omit<TripPost, 'id' | 'createdAt' | 'status'>) => TripPost;
  deleteTrip: (id: string) => void;
  toggleTripStatus: (id: string) => void;
  resetAllDataToDemoBeginning: () => void;
}

const STORAGE_KEY = 'luggage_share_trips_v1';

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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
  const [activeTab, setActiveTab] = useState<'browse' | 'how_it_works' | 'safety' | 'my_trips'>('browse');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to persist trips', e);
    }
  }, [trips]);

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

    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (selectedTripId === id) {
      closeTripDetail();
    }
  };

  const toggleTripStatus = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'active' ? 'fully_booked' : 'active';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
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
        setActiveTab,
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
