import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { TripCard } from './TripCard';
import { AdsterraAdCard } from './AdsterraAdCard';
import { filterAndSortTrips } from '../utils/tripUtils';
import { buildFeedWithAds, consumeNextAdRotationOffset } from '../utils/adUtils';
import { SearchX, Luggage, ArrowUpDown, Plus, Loader2, ChevronDown } from 'lucide-react';

export const TripList: React.FC = () => {
  const { trips: allTrips, isLoadingTrips, filters, updateFilterField, resetFilters, openPostModal } = useTrips();
  const { t } = useLanguage();

  // Client-Side Pagination & Infinite Scroll state
  const [displayedCount, setDisplayedCount] = useState<number>(10);
  const [adRotationOffset] = useState<number>(() => consumeNextAdRotationOffset());

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Determine if user has typed into search inputs or applied filters
  const hasActiveFilters = Boolean(
    (filters.query && filters.query.trim()) ||
    (filters.departureCity && filters.departureCity.trim()) ||
    (filters.arrivalCity && filters.arrivalCity.trim()) ||
    filters.minWeight !== undefined ||
    filters.maxWeight !== undefined ||
    filters.dateFrom
  );

  // Perform search filtering across the entire trips dataset in memory
  const filteredTrips = useMemo(() => {
    return filterAndSortTrips(allTrips, filters);
  }, [allTrips, filters]);

  // Reset displayedCount when search inputs change
  useEffect(() => {
    setDisplayedCount(10);
  }, [filters.query, filters.departureCity, filters.arrivalCity, filters.minWeight, filters.maxWeight, filters.dateFrom]);

  // Render displayedCount items when unfiltered, or all matching results when filtered
  const visibleTrips = useMemo(() => {
    if (hasActiveFilters) {
      return filteredTrips;
    }
    return filteredTrips.slice(0, displayedCount);
  }, [hasActiveFilters, filteredTrips, displayedCount]);

  // Interleave partner/ad cards after every 5 regular trip cards
  const feedItems = useMemo(() => {
    return buildFeedWithAds(visibleTrips, 5, adRotationOffset);
  }, [visibleTrips, adRotationOffset]);

  // Load the next 10 items immediately without artificial timers
  const loadMoreItems = useCallback(() => {
    if (hasActiveFilters || displayedCount >= filteredTrips.length) {
      return;
    }
    setDisplayedCount((prev) => Math.min(prev + 10, filteredTrips.length));
  }, [hasActiveFilters, displayedCount, filteredTrips.length]);

  // Infinite Scroll detector using IntersectionObserver
  useEffect(() => {
    if (hasActiveFilters || displayedCount >= filteredTrips.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      
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
              className="sort-select-compact px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="date_asc">{t('sortDateAsc')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isLoadingTrips && allTrips.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium">Loading listings...</span>
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
            {feedItems.map((item) =>
              item.type === 'trip' ? (
                <TripCard key={item.trip.id} trip={item.trip} />
              ) : (
                <AdsterraAdCard
                  key={item.id}
                  variant="feed"
                  slotKey={item.id}
                  customAd={item.customAd}
                />
              )
            )}
          </div>

          {/* Infinite Scroll detector element */}
          {!hasActiveFilters && displayedCount < filteredTrips.length && (
            <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={loadMoreItems}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer border border-blue-400/30"
              >
                <span>Load More Trips ({filteredTrips.length - displayedCount} remaining)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
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
