import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { TripCard } from './TripCard';
import { filterAndSortTrips } from '../utils/tripUtils';
import { SearchX, Luggage, ArrowUpDown, Plus } from 'lucide-react';

export const TripList: React.FC = () => {
  const { trips, filters, updateFilterField, resetFilters, openPostModal } = useTrips();
  const { t } = useLanguage();

  const filteredTrips = filterAndSortTrips(trips, filters);

  const hasActiveFilters = Boolean(
    filters.query || filters.departureCity || filters.arrivalCity || filters.minWeight || filters.maxWeight
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Sub-header: Results count & Sort control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t('availableTripsHeading')}
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
            {filteredTrips.length} {filteredTrips.length === 1 ? t('tripSingular') : t('tripPlural')}
          </span>
        </div>

        {/* Sort Dropdown */}
        {trips.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {t('sortLabel')}
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilterField('sortBy', e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="date_asc">{t('sortDateAsc')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Luggage className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('noTripsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
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
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs my-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('noMatchingTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {t('noMatchingDesc')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

    </section>
  );
};
