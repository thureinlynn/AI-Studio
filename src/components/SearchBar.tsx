import React from 'react';
import { useTrips } from '../context/TripContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, X, Filter } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const { filters, updateFilterField, resetFilters } = useTrips();
  const { t } = useLanguage();

  const hasActiveFilters = Boolean(
    filters.query || filters.departureCity || filters.arrivalCity || filters.minWeight || filters.maxWeight
  );

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search controls form */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* General Search Input */}
            <div className="md:col-span-5 relative">
              <label htmlFor="search-query" className="sr-only">Search trips, cities, or keywords</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="search-query"
                type="text"
                value={filters.query}
                onChange={(e) => updateFilterField('query', e.target.value)}
                placeholder={t('searchQueryPlaceholder')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Departure City */}
            <div className="md:col-span-3 relative">
              <label htmlFor="dept-city" className="sr-only">Departure city</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                id="dept-city"
                type="text"
                value={filters.departureCity}
                onChange={(e) => updateFilterField('departureCity', e.target.value)}
                placeholder={t('fromPlaceholder')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Arrival City */}
            <div className="md:col-span-3 relative">
              <label htmlFor="arr-city" className="sr-only">Arrival city</label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </div>
              <input
                id="arr-city"
                type="text"
                value={filters.arrivalCity}
                onChange={(e) => updateFilterField('arrivalCity', e.target.value)}
                placeholder={t('toPlaceholder')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Weight / Filter quick button */}
            <div className="md:col-span-1 flex items-center">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('clearFilters')}</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-medium rounded-xl flex items-center justify-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>All</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
