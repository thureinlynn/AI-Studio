import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { TripCard } from './TripCard';
import { filterAndSortTrips } from '../utils/tripUtils';
import { TripPost } from '../types/trip';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { SearchX, Luggage, ArrowUpDown, Plus, Loader2, ChevronDown } from 'lucide-react';

export const TripList: React.FC = () => {
  const { trips: contextTrips, filters, updateFilterField, resetFilters, openPostModal } = useTrips();
  const { t } = useLanguage();

  // 1. Data Fetching: store all available trip listings from Firebase Firestore initial load in state
  const [allTrips, setAllTrips] = useState<TripPost[]>(contextTrips || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 2. Client-Side Pagination & Infinite Scroll state
  const [displayedCount, setDisplayedCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch all available trip listings from Firebase Firestore initial load
  useEffect(() => {
    let isMounted = true;
    const fetchAllFirestoreTrips = async () => {
      try {
        setIsLoading(true);
        const snap = await getDocs(collection(db, 'trips'));
        if (!snap.empty && isMounted) {
          const fetched: TripPost[] = [];
          snap.forEach((docSnap) => {
            fetched.push({ ...(docSnap.data() as TripPost), id: docSnap.id });
          });
          fetched.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setAllTrips(fetched);
        }
      } catch (err) {
        console.warn('[Firestore] Initial trips fetch note:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAllFirestoreTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with context trips in case trips are added, modified, or deleted in the app
  useEffect(() => {
    if (contextTrips && contextTrips.length > 0) {
      setAllTrips(contextTrips);
    }
  }, [contextTrips]);

  // Determine if user has typed into search inputs or applied filters
  const hasActiveFilters = Boolean(
    (filters.query && filters.query.trim()) ||
    (filters.departureCity && filters.departureCity.trim()) ||
    (filters.arrivalCity && filters.arrivalCity.trim()) ||
    filters.minWeight !== undefined ||
    filters.maxWeight !== undefined ||
    filters.dateFrom
  );

  // 3. Search & Filtering Behavior:
  // Perform search filtering across the ENTIRE allTrips dataset in memory, NOT just the visible/sliced array.
  const filteredTrips = useMemo(() => {
    return filterAndSortTrips(allTrips, filters);
  }, [allTrips, filters]);

  // Reset displayedCount when search inputs change
  useEffect(() => {
    setDisplayedCount(10);
  }, [filters.query, filters.departureCity, filters.arrivalCity, filters.minWeight, filters.maxWeight, filters.dateFrom]);

  // When rendering the default trip list (unfiltered), render only the first displayedCount items from allTrips.
  // If a search/filter query is active, display all matching results from filteredTrips so users immediately find trips.
  const visibleTrips = useMemo(() => {
    if (hasActiveFilters) {
      return filteredTrips;
    }
    return filteredTrips.slice(0, displayedCount);
  }, [hasActiveFilters, filteredTrips, displayedCount]);

  // Function to load the next 10 items
  const loadMoreItems = useCallback(() => {
    if (hasActiveFilters || displayedCount >= filteredTrips.length || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    // Simulate slight natural buffer for smooth rendering transition
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 10, filteredTrips.length));
      setIsLoadingMore(false);
    }, 150);
  }, [hasActiveFilters, displayedCount, filteredTrips.length, isLoadingMore]);

  // Infinite Scroll detector using IntersectionObserver
  useEffect(() => {
    if (hasActiveFilters || displayedCount >= filteredTrips.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [hasActiveFilters, displayedCount, filteredTrips.length, loadMoreItems]);

  // Fallback scroll listener in case IntersectionObserver is constrained
  useEffect(() => {
    if (hasActiveFilters || displayedCount >= filteredTrips.length) {
      return;
    }

    const handleWindowScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 350) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [hasActiveFilters, displayedCount, filteredTrips.length, loadMoreItems]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Sub-header: Results count & Sort control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t('availableTripsHeading')}
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full tabular-nums">
            {hasActiveFilters
              ? `${filteredTrips.length} ${filteredTrips.length === 1 ? 'match' : 'matches'}`
              : `${visibleTrips.length} of ${filteredTrips.length} ${filteredTrips.length === 1 ? t('tripSingular') : t('tripPlural')}`}
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Filtered in-memory from {allTrips.length} total
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        {allTrips.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {t('sortLabel')}
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilterField('sortBy', e.target.value as any)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="date_asc">{t('sortDateAsc')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isLoading && allTrips.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium">Loading listings from Firestore...</span>
        </div>
      ) : allTrips.length === 0 ? (
        /* Empty State (No trips at all in database) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto space-y-4 shadow-xs my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Luggage className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('noTripsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {t('noTripsDesc')}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={openPostModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('postFirstTripBtn')}</span>
            </button>
          </div>
        </div>
      ) : filteredTrips.length === 0 ? (
        /* Empty Filter State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto space-y-4 shadow-xs my-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('noMatchingTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {t('noMatchingDesc')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('clearFilters')}
              </button>
            )}
            <button
              onClick={openPostModal}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('navPost')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Trips with Pagination & Infinite Scroll */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {/* Infinite Scroll detector element */}
          {!hasActiveFilters && displayedCount < filteredTrips.length && (
            <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Loading more trips...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={loadMoreItems}
                  className="px-5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Load More Trips ({filteredTrips.length - displayedCount} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* End of feed banner when all items are displayed */}
          {!hasActiveFilters && displayedCount >= filteredTrips.length && filteredTrips.length > 10 && (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
              You've viewed all {filteredTrips.length} available trips
            </div>
          )}
        </>
      )}

    </section>
  );
};
